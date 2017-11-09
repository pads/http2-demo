document.addEventListener('DOMContentLoaded', () => {
  const message = 'I am the vendor bundle loaded';

  console.log(message);

  const element  = document.createElement('p');
  const text = document.createTextNode(message);
  element.appendChild(text);
  document.body.appendChild(element);
});
