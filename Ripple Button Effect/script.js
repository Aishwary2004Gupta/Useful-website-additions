
// Ripple color control
document.getElementById('rippleColor').addEventListener('input', function () {
    document.querySelectorAll('button span').forEach(span => {
        span.style.background = this.value;
    });
});
// Border radius control
document.getElementById('borderRadius').addEventListener('input', function () {
    document.querySelectorAll('button').forEach(btn => {
        btn.style.borderRadius = this.value + 'px';
    });
});
// Blur control
document.getElementById('blurControl').addEventListener('input', function () {
    document.getElementById('svg-blur').setAttribute('stdDeviation', this.value);
});
// Matrix control
document.getElementById('matrixControl').addEventListener('input', function () {
    let matrix = document.getElementById('svg-matrix').getAttribute('values').split(/\s+/);
    matrix[19] = this.value;
    document.getElementById('svg-matrix').setAttribute('values', matrix.join(' '));
});
// Mode control (for demo, just logs)
document.getElementById('modeSelect').addEventListener('change', function () {
    console.log('Mode:', this.value);
});
// Theme control (for demo, just logs)
document.getElementById('themeSelect').addEventListener('change', function () {
    console.log('Theme:', this.value);
});
// Debug and Top toggles (for demo, just logs)
document.getElementById('debugToggle').addEventListener('change', function () {
    console.log('Debug:', this.checked);
});
document.getElementById('topToggle').addEventListener('change', function () {
    console.log('Top:', this.checked);
});
