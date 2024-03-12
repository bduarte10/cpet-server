const express = require('express')
const path = require('path')
const nodemailer = require('nodemailer')
const mailgunTransport = require('nodemailer-mailgun-transport')

const app = express()

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
})

// Rota para servir a página React
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
