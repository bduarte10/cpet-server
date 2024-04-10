const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const mailgunTransport = require('nodemailer-mailgun-transport');
const cors = require('cors'); //Importa o cors para proteção basica da aplicação

const app = express();

app.use(cors()); //Se deseja bloquear requisições de dominios diferentes, faça o bloqueio usando o cors

app.use(express.static(path.join(__dirname, 'build')))
app.use(express.json()) // Adicione este middleware para analisar o corpo da solicitação como JSON

// Configuração de transporte de e-mail com Mailgun
const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: 'sandbox9de6cef58bdb44bbb1213fee3df411aa.mailgun.org', // Altere para o seu domínio configurado no Mailgun
  },
}

const transporter = nodemailer.createTransport(mailgunTransport(auth))

// Rota para lidar com o envio de e-mail
app.post('/send-email', async function (req, res) {
  const { celular, email, nome } = req.body // Remove o await aqui, pois req.body não é uma promessa

  const mailOptions = {
    from: 'duartebruno2208@gmail.com',
    // to: 'deboraaustralia1@gmail.com',
    to: 'duartebruno2208@gmail.com',
    subject: 'Lead CPET',
    text: `Nome: ${nome}\nEmail: ${email}\nCelular: ${celular}`, // Ajuste o formato do corpo do e-mail
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error('Erro ao enviar e-mail:', error)
      res.status(500).send('Erro ao enviar e-mail')
    } else {
      console.log('E-mail enviado:', info.response)
      res.send('E-mail enviado com sucesso')
    }
  })
});

app.post('/lead/email/send', async function (req, res){
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
      user: process.env.CONF_MAIL_SENDER,
      pass: process.env.CONF_MAIL_SENDER_PASS
    }
  });

  const messageToOwner = {
    to: process.env.CONF_MAIL_OWNER, //E-MAIL DO DONO DO SITE QUE VAI RECEBER O CONTATO DO LEAD
    from: process.env.CONF_MAIL_SENDER, //E-MAIL CADASTRADO NO SERVIÇO SENDGRID QUE FARA O DISPARO
    subject: 'Lead CPET ' + (new Date()).toLocaleDateString().toString() + ' - ' + req.body.email,
    html: `<p><strong>Novo lead CPET</strong></p>
        <p>Telefone: ${req.body.nome}</p>
        <p>Telefone: ${req.body.celular}</p>
        <p>E-mail: ${req.body.email}</p>`
  };

  transporter.sendMail(messageToOwner, (errorOwner, infoOwner) => {
      if(errorOwner){
        console.error('Erro ao enviar e-mail:', errorOwner);
        res.status(500).send('Erro ao enviar e-mail');
      } else {
        const messageToLead = {
          to: req.body.email, //E-MAIL DO LEAD QUE RECEBERA A CONFIRMAÇÃO DO PEDIDO DE CONTATO
          from: process.env.CONF_MAIL_SENDER, //E-MAIL CADASTRADO NO SERVIÇO SENDGRID QUE FARA O DISPARO
          subject: 'ConectaEdu - CPET - Confirmação de recebimento de contato',
          html: `<p><strong>Confirmação de recebimento de contato</strong></p>
          <p><strong>Olá ${req.body.nome} [${req.body.email}].</strong></p>
          <p>Este e-mail é uma confirmação de que recebemos o seu contato e iremos retornar em breve.</p>
          <p>Contudo, sinta-se a vontade para nos contatar diretamente no Whatsapp [ +55 (38) 98405-8014 ] clicando aqui: https://wa.me/+5538984058014</p>`
        };

        transporter.sendMail(messageToLead, (errorLead, infoLead) => {
          if(errorLead){
            res.status(500).send('Erro ao enviar e-mail');
          } else {
            res.status(200).send('E-mail enviado com sucesso!');
          }
        });
      }
  });
});


// Rota para servir a página React
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
});