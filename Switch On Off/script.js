//just for the background 
document.querySelector('.switch input').addEventListener('change', function(e) {
  if (e.target.checked) {
    document.body.classList.remove('switch-off');
  } else {
    document.body.classList.add('switch-off');
  }
});