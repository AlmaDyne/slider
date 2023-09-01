'use strict';

const baseElem = document.getElementById('base-elem');
baseElem.insertAdjacentHTML('beforeend', '<p class="base-info">(Not setted)</p>');
const baseInfo = document.querySelector('.base-info');
let iClick = 0;
const docHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight
);
const docWidth = Math.max(
    document.body.scrollWidth, document.documentElement.scrollWidth,
    document.body.offsetWidth, document.documentElement.offsetWidth,
    document.body.clientWidth, document.documentElement.clientWidth
);
const slider = document.getElementById('slider');
const options = document.getElementById('options');
const paramValue = document.getElementById('param-value');
const paramMinRange = document.getElementById('param-min-range');
const paramMaxRange = document.getElementById('param-max-range');
const paramStep = document.getElementById('param-step');

options.onclick = () => {
    sliderFunc(slider, +paramValue.value, +paramMinRange.value, +paramMaxRange.value, +paramStep.value);
};

//sliderFunc(slider, 100, 0, 99, 7);

function sliderFunc(sliderElem, value, minRange, maxRange, step) {
    if (maxRange < minRange) maxRange = minRange;

    const level = sliderElem.querySelector('.thumb');
    const sliderRange = sliderElem.offsetWidth - level.offsetWidth;
    const scaleRange = maxRange - minRange;
    const k = sliderRange / scaleRange; // Коэффициент преобразования шкалы
    const xMax = Math.round(Math.floor(scaleRange / step) * step * k); // Макс. x для макс. ScaleX
    const xMin = 0;
    const maxValue = Math.floor(scaleRange / step) * step + minRange;
    const minValue = minRange;

    value = Math.round((value - minRange) / step) * step + minRange;
    if (value < minRange) value = minValue;
    if (value > maxRange) value = maxValue;
    sliderElem.setAttribute('data-value', value);

    let x = (k != Infinity) ? Math.round((value - minValue) * k) : xMin; // Значение x относительно начального value
    let lastX = x;
    let scaleX = (k != Infinity) ? Math.floor(x / k / step) : 0; // Деление новой шкалы

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

            if (x > xMax) x = xMax;
            if (x < xMin) x = xMin;

            if ((x > lastX) && (Math.floor(x / k / step) != scaleX)) {
                level.style.left = x + 'px';
                
                scaleX = Math.floor(x / k / step);
                value = scaleX * step + minRange;
                sliderElem.setAttribute('data-value', value);
                x = Math.round(scaleX * k * step); // Подсчитать значение x относительно scaleX (x увеличивается)
                lastX = x;
                
                displayData();
            }
            
            if ((x < lastX) && (Math.ceil(x / k / step) != scaleX)) {
                level.style.left = x + 'px';

                scaleX = Math.ceil(x / k / step);
                value = scaleX * step + minRange;
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

baseElem.addEventListener('click', () => {
    clickCount(++iClick, baseInfo);
});
