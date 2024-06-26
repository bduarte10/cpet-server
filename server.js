const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: [
      "https://www.disciplinas-isoladas.conectaedu.com.br",
      "https://disciplinas-isoladas.conectaedu.com.br",
      "https://conectaedu.com.br",
    ],
  })
);

app.use(express.static(path.join(__dirname, "build")));
app.use(express.json()); // Adicione este middleware para analisar o corpo da solicitação como JSON

app.post("/lead/email/send", async function (req, res) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CONF_MAIL_SENDER,
      pass: process.env.CONF_MAIL_SENDER_PASS,
    },
  });

  const messageToOwner = {
    to: process.env.CONF_MAIL_OWNER, //E-MAIL DO DONO DO SITE QUE VAI RECEBER O CONTATO DO LEAD
    from: process.env.CONF_MAIL_SENDER, //E-MAIL CADASTRADO NO SERVIÇO SENDGRID QUE FARA O DISPARO
    subject: "Lead CPET " + new Date().toLocaleDateString().toString() + " - " + req.body.email,
    html: `<p><strong>Novo lead CPET</strong></p>
        <p>Nome: ${req.body.nome}</p>
        <p>Telefone: ${req.body.celular}</p>
        <p>E-mail: ${req.body.email}</p>`,
  };

  transporter.sendMail(messageToOwner, (errorOwner, infoOwner) => {
    if (errorOwner) {
      console.error("Erro ao enviar e-mail:", errorOwner);
      res.status(500).send("Erro ao enviar e-mail");
    } else {
      const messageToLead = {
        to: req.body.email, //E-MAIL DO LEAD QUE RECEBERA A CONFIRMAÇÃO DO PEDIDO DE CONTATO
        from: process.env.CONF_MAIL_SENDER, //E-MAIL CADASTRADO NO SERVIÇO SENDGRID QUE FARA O DISPARO
        subject: "ConectaEdu - CPET - Confirmação de recebimento de contato",
        html: `<p><strong>Confirmação de recebimento de contato</strong></p>
          <p><strong>Olá ${req.body.nome} [${req.body.email}].</strong></p>
          <p>Este e-mail é uma confirmação de que recebemos o seu contato e iremos retornar em breve.</p>
          <p>Contudo, sinta-se a vontade para nos contatar diretamente no Whatsapp [ +55 (38) 98405-8014 ] clicando aqui: https://wa.me/+5538984058014</p>`,
      };

      transporter.sendMail(messageToLead, (errorLead, infoLead) => {
        if (errorLead) {
          res.status(500).send("Erro ao enviar e-mail", errorLead);
        } else {
          res.status(200).send("E-mail enviado com sucesso!", infoLead);
        }
      });
    }
  });
});

app.post("/lead/disciplinas-isoladas", async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CONF_MAIL_SENDER,
      pass: process.env.CONF_MAIL_SENDER_PASS,
    },
  });

  const messageToOwner = {
    to: process.env.CONF_MAIL_DISC_ISOLADA,
    from: process.env.CONF_MAIL_SENDER,
    subject: "Lead Disciplinas Isoladas " + new Date().toLocaleDateString().toString() + " - " + req.body.email,
    html: `<p><strong>Novo lead CPET</strong></p>
        <p>Nome: ${req.body.nome}</p>
        <p>Telefone: ${req.body.telefone}</p>
         ${req.body.email ? `E-mail: ${req.body.email}` : ""}`,
  };

  const sendOwnerEmail = new Promise((resolve, reject) => {
    transporter.sendMail(messageToOwner, (error, info) => {
      if (error) {
        reject(error);
      } else {
        resolve(info);
      }
    });
  });

  let sendLeadEmail;
  if (req.body.email.trim() !== "") {
    const messageToLead = {
      to: req.body.email,
      from: process.env.CONF_MAIL_SENDER,
      subject: "ConectaEdu - Disciplinas Isoladas - Confirmação de recebimento de contato",
      html: `<p><strong>Confirmação de recebimento de contato</strong></p>
            <p><strong>Olá ${req.body.nome}</strong></p>
            <p>Este e-mail é uma confirmação de que recebemos o seu contato e iremos retornar em breve.</p>
            `,
    };

    sendLeadEmail = new Promise((resolve, reject) => {
      transporter.sendMail(messageToLead, (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      });
    });
  }
  try {
    (await Promise.all([sendOwnerEmail, sendLeadEmail])).filter(Boolean);
    res.status(200).send("E-mails enviados com sucesso!");
  } catch (error) {
    res.status(500).send("Erro ao enviar e-mails");
  }
});

app.get("*", function (_, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
