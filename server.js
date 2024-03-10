const express = require('express')
const path = require('path')
const nodemailer = require('nodemailer')
const mailgunTransport = require('nodemailer-mailgun-transport')

const app = express()

app.use(express.static(path.join(__dirname, 'build')))
app.use(express.json())

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: 'sandbox9de6cef58bdb44bbb1213fee3df411aa.mailgun.org',
  },
}

const transporter = nodemailer.createTransport(mailgunTransport(auth))

app.post('/send-email', async function (req, res) {
  const { celular, email, nome } = req.body

  // Primeiro e-mail para o proprietário
  const ownerMailOptions = {
    from: 'duartebruno2208@gmail.com',
    to: 'duartebruno2208@gmail.com', // Seu e-mail
    subject: 'Novo Lead CPET',
    text: `Nome: ${nome}\nEmail: ${email}\nCelular: ${celular}`,
  }

  // Segundo e-mail para o lead
  const leadMailOptions = {
    from: 'conectaedubrasil@gmail.com',
    to: email, // E-mail do lead
    subject: 'Recebemos seu contato!',
    text: `Olá ${nome},\n\nSuas informações foram recebidas com sucesso. Retornaremos o mais breve possível.`,
  }

  transporter.sendMail(ownerMailOptions, function (error, info) {
    if (error) {
      console.error('Erro ao enviar e-mail para proprietário:', error)
      res.status(500).send('Erro ao enviar e-mail para proprietário')
    } else {
      console.log('E-mail enviado para proprietário:', info.response)

      // Envia o segundo e-mail para o lead
      transporter.sendMail(leadMailOptions, function (error, info) {
        if (error) {
          console.error('Erro ao enviar e-mail para lead:', error)
          res.status(500).send('Erro ao enviar e-mail para lead')
        } else {
          console.log('E-mail enviado para lead:', info.response)
          res.send('E-mails enviados com sucesso')
        }
      })
    }
  })
})

// Rota para servir a página React
app.get('*', function (_, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
