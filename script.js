'use strict';

const baseElem = document.getElementById('base-elem');
baseElem.insertAdjacentHTML('beforeend', '<p class="base-info">(Not setted)</p>');
const baseInfo = document.querySelector('.base-info');
const slider = document.getElementById('slider');
const options = document.getElementById('options');
const paramValue = document.getElementById('param-value');
const paramMinLimit = document.getElementById('param-min-range');
const paramMaxLimit = document.getElementById('param-max-range');
const paramStep = document.getElementById('param-step');

options.onclick = () => {
    sliderFunc(slider, +paramMinLimit.value, +paramMaxLimit.value, +paramValue.value, +paramStep.value, true);
};

function sliderFunc(sliderElem, minLimit, maxLimit, value, step, showValue = true) {
    if (maxLimit < minLimit) maxLimit = minLimit;
    if (step < 0) step = 0;

    const marker = sliderElem.querySelector('.thumb');
    const sliderRange = sliderElem.offsetWidth - marker.offsetWidth;
    const scaleRange = maxLimit - minLimit;
    const k = sliderRange / scaleRange; // Коэффициент преобразования новой шкалы от длины слайдера
    const minValue = minLimit;
    const maxValue = Math.floor(scaleRange / step) * step + minValue;
    const SHOW_VALUE_TIME_DELAY = 200;
    let showValueTimer = null;

    value = Math.round((value - minValue) / step) * step + minValue;
    if (value < minLimit) value = minValue;
    if (value > maxLimit) value = maxValue;

    sliderElem.setAttribute('data-minLimit', minLimit);
    sliderElem.setAttribute('data-maxLimit', maxLimit);
    sliderElem.setAttribute('data-value', value);
    sliderElem.setAttribute('data-step', step);
    sliderElem.setAttribute('data-showValue', showValue);

    let scaleX = (value - minValue) / step; // Номер деления на новой шкале для value
    let x = (k != Infinity) ? Math.round((value - minValue) * k) : 0; // Значение x относительно начального value
    let lastX = x;

    marker.style.left = x + 'px';

    changeColor();
    displayData();

    if (showValue) {
        var valueOutput = document.createElement('span');
        valueOutput.style.cssText = `
            position: absolute;
            top: -28px;
        `;
        valueOutput.className = 'show-value';
        valueOutput.hidden = true;
        marker.after(valueOutput);
    }

    sliderElem.ondragstart = false;
    sliderElem.onpointerdown = sliderStart;
    
    function sliderStart(event) {
        event.preventDefault();
        if (event.target != marker) return;
        if (sliderElem.hasAttribute('data-disabled')) return;

        if (valueOutput) {
            clearTimeout(showValueTimer);

            valueOutput.hidden = false;
            valueOutput.innerHTML = sliderElem.dataset.value;
            valueOutput.style.left = lastX + marker.offsetWidth / 2 - valueOutput.offsetWidth / 2 + 'px';
        }

        const shiftX = event.clientX - marker.getBoundingClientRect().left;

        document.documentElement.style.cursor = 'pointer';

        document.addEventListener('pointermove', moveMarker);
        document.addEventListener('pointerup', releaseMarker);
    
        function moveMarker(event) {
            let isShift = false;

            x = event.clientX - shiftX - sliderElem.getBoundingClientRect().left;

            if (x < 0) x = 0;
            if (x > sliderRange) x = sliderRange;

            if ((x > lastX) && (Math.floor(x / k / step) != scaleX)) {
                scaleX = Math.floor(x / k / step);
                isShift = true;
            }
            if ((x < lastX) && (Math.ceil(x / k / step) != scaleX)) {
                scaleX = Math.ceil(x / k / step);
                isShift = true;
            }

            if (isShift) {
                value = scaleX * step + minValue;
                x = Math.round(scaleX * k * step); // Целое значение x относительно scaleX
                lastX = x;

                marker.style.left = x + 'px';

                sliderElem.setAttribute('data-value', value);
                if (valueOutput) {
                    valueOutput.innerHTML = sliderElem.dataset.value;
                    valueOutput.style.left = lastX + marker.offsetWidth / 2 - valueOutput.offsetWidth / 2 + 'px';
                }

                changeColor();
                displayData();
            }
        }

        function releaseMarker() {
            document.documentElement.style.cursor = '';

            if (valueOutput) showValueTimer = setTimeout(() => valueOutput.hidden = true, SHOW_VALUE_TIME_DELAY);

            document.removeEventListener('pointermove', moveMarker);
            document.removeEventListener('pointerup', releaseMarker);
        }
    }

    function changeColor() {
        const maxColorValue = 245;
        let xRatio = x / sliderRange,
            colorDivider = 0.75,
            colorRed,
            colorGreen,
            colorBlue;

        if (xRatio <= colorDivider) {
            colorGreen = maxColorValue;
            colorRed = maxColorValue * xRatio * (1 / colorDivider);
            colorBlue = 0;
        } else {
            colorRed = maxColorValue;
            colorBlue = maxColorValue * (xRatio - colorDivider) * colorDivider;
            colorGreen = maxColorValue - maxColorValue * (xRatio - colorDivider) * (1 / (1 - colorDivider)) + colorBlue;
        }

        sliderElem.style.backgroundColor = `rgb(${colorRed}, ${colorGreen}, ${colorBlue})`;
    }

    function displayData() {
        baseInfo.innerHTML = 'Ratio = ' + (k * step).toFixed(2);
        baseInfo.innerHTML += '<br>x = ' + x;
        baseInfo.innerHTML += '<br>ScaleX = ' + scaleX;
        baseInfo.innerHTML += '<br>Value = ' + sliderElem.dataset.value;
    }
}

