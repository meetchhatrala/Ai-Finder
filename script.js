// document.querySelector('#contact-form').addEventListener('submit', (e) => {
//     e.preventDefault();
//     e.target.elements.name.value = '';
//     e.target.elements.email.value = '';
//     e.target.elements.message.value = '';
//   });

const name=document.getElementById('name').value;
const email=document.getElementById('email')
const subject=document.getElementById('subject');
const submit=document.getElementsByClassName('form')[0]; 

submit.addEventListener('submit', (e) => {

  e.preventDefault();
  console.log("clicked")
 

  Email.send({
    SecureToken : "116cecbd-8f3a-4746-8694-b771446a42f9",
    To : 'coder2948@gmail.com',
    From :'coder2948@gmail.com',
    Subject : document.getElementById('subject').value,
    Body : 'Name: '+ document.getElementById('name').value +'<br\>Email: '+document.getElementById('email').value + '<br\> Message: ' + document.getElementById('message').value
}).then(
  message => alert(message)
);
  
    });
