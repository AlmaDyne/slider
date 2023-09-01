'use strict';

const baseElem = document.getElementById('base-elem');
baseElem.insertAdjacentHTML('beforeend', '<p class="base-info">(Not setted)</p>');
const baseInfo = document.querySelector('.base-info');
const slider = document.getElementById('slider');
const options = document.getElementById('options');
const paramValue = document.getElementById('param-value');
const paramminLimit = document.getElementById('param-min-range');
const parammaxLimit = document.getElementById('param-max-range');
const paramStep = document.getElementById('param-step');

options.onclick = () => {
    sliderFunc(slider, +paramValue.value, +paramminLimit.value, +parammaxLimit.value, +paramStep.value);
};

//sliderFunc(slider, 0, 1, 1, 1);

function sliderFunc(sliderElem, value, minLimit, maxLimit, step) {
    if (maxLimit < minLimit) maxLimit = minLimit;

    const level = sliderElem.querySelector('.thumb');
    const sliderRange = sliderElem.offsetWidth - level.offsetWidth;
    const scaleRange = maxLimit - minLimit;
    const k = sliderRange / scaleRange; // Коэффициент преобразования новой шкалы от длины слайдера
    const minValue = minLimit;
    const maxValue = Math.floor(scaleRange / step) * step + minValue;

    value = Math.round((value - minValue) / step) * step + minValue;
    if (value < minLimit) value = minValue;
    if (value > maxLimit) value = maxValue;
    sliderElem.setAttribute('data-value', value);

    let scaleX = (value - minValue) / step; // Номер деления на новой шкале для value
    let x = (k != Infinity) ? Math.round((value - minValue) * k) : 0; // Значение x относительно начального value
    let lastX = x;

    level.style.left = x + 'px';

    displayData();

    sliderElem.ondragstart = false;
    sliderElem.onmousedown = sliderReady;
    
    function sliderReady(event) {
        event.preventDefault();
        if (event.target != level) return;
    
        const shiftX = event.clientX - level.getBoundingClientRect().left;

        document.documentElement.style.cursor = 'pointer';
        document.addEventListener('mousemove', levelMove);
        document.addEventListener('mouseup', levelRelease);
    
        function levelMove(event) {
            x = event.clientX - shiftX - sliderElem.getBoundingClientRect().left;

            if (x < 0) x = 0;
            if (x > sliderRange) x = sliderRange;

            if ((x > lastX) && (Math.floor(x / k / step) != scaleX)) {
                level.style.left = x + 'px';
                
                scaleX = Math.floor(x / k / step);
                value = scaleX * step + minValue;
                sliderElem.setAttribute('data-value', value);
                x = Math.round(scaleX * k * step); // Подсчитать значение x относительно scaleX (x увеличивается)
                lastX = x;
                
                displayData();
            }
            
            if ((x < lastX) && (Math.ceil(x / k / step) != scaleX)) {
                level.style.left = x + 'px';

                scaleX = Math.ceil(x / k / step);
                value = scaleX * step + minValue;
                sliderElem.setAttribute('data-value', value);
                x = Math.round(scaleX * k * step); // Подсчитать значение x относительно scaleX (x уменьшается)
                lastX = x;

                displayData();
            }
        }

        function levelRelease() {
            document.documentElement.style.cursor = '';
            document.removeEventListener('mousemove', levelMove);
            document.removeEventListener('mouseup', levelRelease);
        }
    }

    function displayData() {
        baseInfo.innerHTML = 'k ≈ ' + k.toFixed(2);
        baseInfo.innerHTML += '<br>x = ' + x;
        baseInfo.innerHTML += '<br>ScaleX = ' + scaleX;
        baseInfo.innerHTML += '<br>Value = ' + sliderElem.dataset.value;
    }
}
