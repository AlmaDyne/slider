'use strict';

const sliderBank = {
    activate,
    disable,
    enable
};

const dataOutput = document.getElementById('data-output');
dataOutput.insertAdjacentHTML('beforeend', '<p class="data-info">(Not setted)</p>');
const dataInfo = document.querySelector('.data-info');

const singleSlider = document.getElementById('single-slider');
const paramSingleValue = document.getElementById('param-single-value');
const paramSingleMinLimit = document.getElementById('param-single-min-range');
const paramSingleMaxLimit = document.getElementById('param-single-max-range');
const paramSingleStep = document.getElementById('param-single-step');
const paramSingleShowValue = document.getElementById('param-single-show-value');
const btnActiveSingle = document.getElementById('btn-active-single');
const btnDisableSingle = document.getElementById('btn-disable-single');
const btnEnableSingle = document.getElementById('btn-enable-single');

btnActiveSingle.onclick = () => {
    sliderBank.enable(singleSlider);

    const marker = singleSlider.querySelector('.thumb');
    marker.innerHTML = '';

    sliderBank.activate(
        singleSlider,
        1,
        +paramSingleMinLimit.value,
        +paramSingleMaxLimit.value,
        +paramSingleValue.value,
        +paramSingleStep.value,
        (paramSingleShowValue.value == 'true') ? true : false
    );

    btnDisableSingle.disabled = false;
    btnEnableSingle.disabled = true;
};
btnDisableSingle.onclick = () => {
    sliderBank.disable(singleSlider);

    btnEnableSingle.disabled = false;
    btnDisableSingle.disabled = true;
};
btnEnableSingle.onclick = () => {
    sliderBank.enable(singleSlider);

    btnDisableSingle.disabled = false;
    btnEnableSingle.disabled = true;
};

sliderBank.activate(singleSlider, 1, 0, 300, 150, 1);

///////////////////////////////////////////////////////////////////////////////////////

const rangeSlider = document.getElementById('range-slider');
const paramValue1 = document.getElementById('param-range-value1');
const paramValue2 = document.getElementById('param-range-value2');
const paramMinLimit = document.getElementById('param-range-min-range');
const paramMaxLimit = document.getElementById('param-range-max-range');
const paramStep = document.getElementById('param-range-step');
const btnActiveRange = document.getElementById('btn-active-range');
const btnDisableRange = document.getElementById('btn-disable-range');
const btnEnableRange = document.getElementById('btn-enable-range');

btnActiveRange.onclick = () => {
    sliderBank.enable(rangeSlider);

    const markers = rangeSlider.querySelectorAll('.thumb');
    markers.forEach(marker => {
        marker.innerHTML = '';
        marker.className = 'thumb';
    });

    sliderBank.activate(
        rangeSlider,
        2,
        +paramMinLimit.value,
        +paramMaxLimit.value,
        +paramValue1.value,
        +paramValue2.value,
        +paramStep.value
    );

    btnDisableRange.disabled = false;
    btnEnableRange.disabled = true;
};
btnDisableRange.onclick = () => {
    sliderBank.disable(rangeSlider);

    btnEnableRange.disabled = false;
    btnDisableRange.disabled = true;
};
btnEnableRange.onclick = () => {
    sliderBank.enable(rangeSlider);

    btnDisableRange.disabled = false;
    btnEnableRange.disabled = true;
};

sliderBank.activate(rangeSlider, 2, 0, 300, 100, 200, 1);

///////////////////////////////////////////////////////////////////////////////////////

dataOutput.firstElementChild.innerHTML = '<b>Data output:</b>';
dataInfo.innerHTML = '(Not setted)';

dataInfo.style.textAlign = '';
dataInfo.style.marginLeft = '';

///////////////////////////////////////////////////////////////////////////////////////

function activate(...args) {
    const type = args[1]; // Type of slider

    args.splice(1, 1);

    switch (type) {
        case 1:
            useSingleSlider(...args);
            break;
        case 2:
            useRangeSlider(...args);
            break;
        default:
            throw new Error('Invalid slider type');
    }

    function useSingleSlider(sliderElem, minLimit, maxLimit, value, step, showValue = true) {
        if (maxLimit < minLimit) maxLimit = minLimit;
        if (step < 0) step = 0;

        const marker = sliderElem.querySelector('.thumb');
        const sliderRange = sliderElem.clientWidth - marker.offsetWidth;
        const scaleRange = maxLimit - minLimit;
        const k = sliderRange / scaleRange; // Коэффициент преобразования новой шкалы от длины слайдера
        const ratio = k * step;
        const minValue = minLimit;
        const maxValue = Math.floor(scaleRange / step) * step + minValue;
        const SHOW_VALUE_TIME_DELAY = 200;
        let valueOutput;
        let showValueTimer;

        value = Math.round((value - minValue) / step) * step + minValue;
        if (value < minLimit) value = minValue;
        if (value > maxLimit) value = maxValue;

        sliderElem.setAttribute('data-type', 'single');
        sliderElem.setAttribute('data-marker-color', getComputedStyle(marker).backgroundColor);
        sliderElem.setAttribute('data-min-limit', minLimit);
        sliderElem.setAttribute('data-max-limit', maxLimit);
        sliderElem.setAttribute('data-value', value);
        sliderElem.setAttribute('data-step', step);
        sliderElem.setAttribute('data-show-value', showValue);

        let scaleX = (value - minValue) / step; // Номер деления на новой шкале для value
        let x = (ratio && ratio != Infinity) ? Math.round((value - minValue) * k) : 0; // Значение x относительно начального value
        let lastX = x;

        marker.style.left = x + 'px';

        changeBandColor();
        displayData();

        if (showValue) {
            valueOutput = document.createElement('span');
            valueOutput.className = 'value-output';
            valueOutput.hidden = true;
            marker.append(valueOutput);
        } else {
            marker.innerHTML = '';
        }

        sliderElem.ondragstart = () => false;
        sliderElem.ontouchstart = () => false;
        sliderElem.onpointerdown = captureMarker;
        
        function captureMarker(event) {
            event.preventDefault();
            if (event.target != marker) return;
            if (sliderElem.hasAttribute('data-disabled')) return;

            displayData();

            if (showValue) {
                clearTimeout(showValueTimer);

                valueOutput.hidden = false;
                valueOutput.innerHTML = sliderElem.dataset.value;
                valueOutput.style.left = marker.offsetWidth / 2 - valueOutput.offsetWidth / 2 + 'px';
            }

            const shiftX = event.clientX - marker.getBoundingClientRect().left;

            marker.style.backgroundColor = '#00b7ff';
            marker.setPointerCapture(event.pointerId);
            
            marker.addEventListener('pointermove', moveMarker);
            marker.addEventListener('pointerup', releaseMarker);
        
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
                    if (showValue) {
                        valueOutput.innerHTML = sliderElem.dataset.value;
                        valueOutput.style.left = marker.offsetWidth / 2 - valueOutput.offsetWidth / 2 + 'px';
                    }

                    changeBandColor();
                    displayData();
                }
            }

            function releaseMarker() {
                marker.style.backgroundColor = '';

                marker.removeEventListener('pointermove', moveMarker);
                marker.removeEventListener('pointerup', releaseMarker);

                if (showValue) showValueTimer = setTimeout(() => valueOutput.hidden = true, SHOW_VALUE_TIME_DELAY);
            }
        }

        function changeBandColor() {
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
            sliderElem.setAttribute('data-band-color', getComputedStyle(sliderElem).backgroundColor);
        }

        function displayData() {
            dataOutput.firstElementChild.innerHTML = '<b>Single slider data:</b>';
            dataInfo.innerHTML = 'Ratio = ' + ratio.toFixed(2);
            dataInfo.innerHTML += '<br>Marker | x = ' + parseInt(marker.style.left);
            dataInfo.innerHTML += '<br>Marker | ScaleX = ' + scaleX;
            dataInfo.innerHTML += '<br>Slider | Value = ' + sliderElem.dataset.value;

            dataInfo.style.textAlign = 'left';
            dataInfo.style.marginLeft = '30px';
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////

    function useRangeSlider(sliderElem, minLimit, maxLimit, value1, value2, step) {
        if (maxLimit < minLimit) maxLimit = minLimit;
        if (step < 0) step = 0;

        const selectedRange = sliderElem.querySelector('.selected-range');
        const markers = sliderElem.querySelectorAll('.thumb');
        const marker1 = markers[0];
        const marker2 = markers[1];
        const markerWidth = marker1.offsetWidth;
        const sliderRange = sliderElem.clientWidth - markerWidth;
        const scaleRange = maxLimit - minLimit;
        const k = sliderRange / scaleRange; // Коэффициент преобразования новой шкалы от длины слайдера
        const ratio = k * step;
        const minValue = minLimit;
        const maxValue = Math.floor(scaleRange / step) * step + minValue;
        let leftMarker, rightMarker, valueOutput;

        value1 = Math.round((value1 - minValue) / step) * step + minValue;
        if (value1 < minLimit) value1 = minValue;
        if (value1 > maxLimit) value1 = maxValue;

        value2 = Math.round((value2 - minValue) / step) * step + minValue;
        if (value2 < minLimit) value2 = minValue;
        if (value2 > maxLimit) value2 = maxValue;

        if (value1 > value2) [value1, value2] = [value2, value1];

        marker1.classList.add('left');
        marker2.classList.add('right');
        leftMarker = marker1;
        rightMarker = marker2;

        sliderElem.setAttribute('data-type', 'range');
        sliderElem.setAttribute('data-band-color', getComputedStyle(sliderElem).background);
        sliderElem.setAttribute('data-selected-range-color', getComputedStyle(selectedRange).backgroundColor);
        sliderElem.setAttribute('data-marker-color', getComputedStyle(marker1).backgroundColor);
        sliderElem.setAttribute('data-minLimit', minLimit);
        sliderElem.setAttribute('data-maxLimit', maxLimit);
        sliderElem.setAttribute('data-value1', value1);
        sliderElem.setAttribute('data-value2', value2);
        sliderElem.setAttribute('data-step', step);

        for (let i = 1; i <= markers.length; i++) {
            const marker = markers[i - 1];
            const value = +sliderElem.getAttribute('data-value' + i);
            const scaleX = (value - minValue) / step;
            const x = (ratio && ratio != Infinity) ? // Значение x относительно начального value
                Math.round((value - minValue) * k) : 0;

            marker.style.left = x + 'px';

            marker.setAttribute('data-value', value);    
            marker.setAttribute('data-scale-x', scaleX);
            marker.setAttribute('data-last-x', x);

            valueOutput = document.createElement('span');
            valueOutput.className = 'value-output';
            valueOutput.innerHTML = value;
            marker.append(valueOutput);
            valueOutput.style.left = marker.offsetWidth / 2 - valueOutput.offsetWidth / 2 + 'px';
        }

        changeSelectedRange();
        displayData();

        sliderElem.ondragstart = () => false;
        sliderElem.ontouchstart = () => false;
        sliderElem.onpointerdown = captureMarker;
        
        function captureMarker(event) {
            event.preventDefault();
            if (!event.target.classList.contains('thumb')) return;
            if (sliderElem.hasAttribute('data-disabled')) return;

            displayData();

            let marker = event.target;
            let otherMarker = (marker == marker1) ? marker2 : marker1;
            let value = +marker.dataset.value;
            let otherValue = +otherMarker.dataset.value;
            let scaleX = +marker.dataset.scaleX;
            let lastX = +marker.dataset.lastX;
            let shiftX = event.clientX - marker.getBoundingClientRect().left;
            let n = marker.classList.contains('left') ? 1 : 2; // Номер маркера, соответствующий номеру value элемента sliderElem
            let lastN = n;

            valueOutput = marker.querySelector('.value-output');
            valueOutput.innerHTML = value;
            valueOutput.style.left = marker.offsetWidth / 2 - valueOutput.offsetWidth / 2 + 'px';
            
            sliderElem.append(marker);
            marker.style.backgroundColor = '#00b7ff';
            marker.setPointerCapture(event.pointerId);

            marker.addEventListener('pointermove', releaseMarker);
            marker.addEventListener('pointerup', releasemarker);
        
            function releaseMarker(event) {
                let isShift = false;
                let x = event.clientX - shiftX - sliderElem.getBoundingClientRect().left - sliderElem.clientLeft;

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

                    if (value < otherValue) {
                        if (marker.classList.contains('right')) {
                            marker.classList.remove('right');
                            marker.classList.add('left');
                            otherMarker.classList.remove('left');
                            otherMarker.classList.add('right');
                            n = 1;
                            leftMarker = marker;
                            rightMarker = otherMarker;
                        }
                    } else if (value > otherValue) {
                        if (marker.classList.contains('left')) {
                            marker.classList.remove('left');
                            marker.classList.add('right');
                            otherMarker.classList.remove('right');
                            otherMarker.classList.add('left');
                            n = 2;
                            leftMarker = otherMarker;
                            rightMarker = marker;
                        }
                    } else {
                        changeSelectedRange();
                    }
                    
                    sliderElem.setAttribute('data-value' + n, value);

                    // Если при быстром движении метка перехода с предыдущего value была пропущена и его значение не поменялось
                    if (lastN != n) {
                        const savedN = n;
                        n = lastN; // Возвращение к предыдущему значению n
                        sliderElem.setAttribute('data-value' + n, otherValue);
                        lastN = n = savedN;
                    }

                    marker.setAttribute('data-value', value);
                    marker.setAttribute('data-scale-x', scaleX);
                    marker.setAttribute('data-last-x', lastX);

                    valueOutput.innerHTML = value;
                    valueOutput.style.left = marker.offsetWidth / 2 - valueOutput.offsetWidth / 2 + 'px';

                    changeSelectedRange();
                    displayData();
                }
            }

            function releasemarker() {
                marker.style.backgroundColor = '';

                marker.removeEventListener('pointermove', releaseMarker);
                marker.removeEventListener('pointerup', releasemarker);
            }
        }

        function changeSelectedRange() {
            const xStartPos = parseInt(leftMarker.style.left) + markerWidth;
            let width = parseInt(rightMarker.style.left) - xStartPos;
            if (width < 0) width = 0;

            selectedRange.style.left = xStartPos + 'px';
            selectedRange.style.width = width + 'px';
        }

        function displayData() {
            dataOutput.firstElementChild.innerHTML = '<b>Range slider data:</b>';
            dataInfo.innerHTML = 'Ratio = ' + ratio.toFixed(2);
            dataInfo.innerHTML += '<br>Marker 1 | x = ' + parseInt(marker1.style.left);
            dataInfo.innerHTML += '<br>Marker 1 | ScaleX = ' + marker1.dataset.scaleX;
            dataInfo.innerHTML += '<br>Marker 2 | x = ' + parseInt(marker2.style.left);
            dataInfo.innerHTML += '<br>Marker 2 | ScaleX = ' + marker2.dataset.scaleX;
            dataInfo.innerHTML += '<br>Slider | Value 1 = ' + sliderElem.dataset.value1;
            dataInfo.innerHTML += '<br>Slider | Value 2 = ' + sliderElem.dataset.value2;

            dataInfo.style.textAlign = 'left';
            dataInfo.style.marginLeft = '30px';
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////

function disable(...sliders) {
    for (let sliderElem of sliders) {
        sliderElem.setAttribute('data-disabled', '');
        sliderElem.style.background = '#dddddd';

        const markers = sliderElem.querySelectorAll('.thumb');
        for (let marker of markers) {
            marker.style.backgroundColor = '#979797';
            marker.style.cursor = 'not-allowed';
        }

        if (sliderElem.dataset.type == 'range') {
            const selectedRange = sliderElem.querySelector('.selected-range');
            selectedRange.style.backgroundColor = '#b1b1b1';

            const valueOutputs = sliderElem.querySelectorAll('.value-output');
            valueOutputs.forEach(valOut => valOut.hidden = true);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////////////

function enable(...sliders) {
    for (let sliderElem of sliders) {
        sliderElem.removeAttribute('data-disabled', '');
        sliderElem.style.background = sliderElem.dataset.bandColor;

        const markers = sliderElem.querySelectorAll('.thumb');
        for (let marker of markers) {
            marker.style.backgroundColor = sliderElem.dataset.markerColor;
            marker.style.cursor = 'pointer';
        }

        if (sliderElem.dataset.type == 'range') {
            const selectedRange = sliderElem.querySelector('.selected-range');
            selectedRange.style.backgroundColor = sliderElem.dataset.selectedRangeColor;

            const valueOutputs = sliderElem.querySelectorAll('.value-output');
            valueOutputs.forEach(valOut => valOut.hidden = false);
        }
    }
}
