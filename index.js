require("dotenv").config();
const express = require("express");
const httpProxy = require("http-proxy");
const db = require("./models");
const Sequelize = require("sequelize");

require("dotenv").config();
const app = express();

db.sequelize
  .sync()
  .then(() => {
    console.log("Synced db on S3 proxy server.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

const BASE_PATH = `https://web-host-project-outputs.s3.ap-south-1.amazonaws.com/__outputs`;
const proxy = httpProxy.createProxy();

app.use(async (req, res) => {
  try {
    const hostname = req.hostname;
    const subdomain = hostname.split(".")[0];
    const project = await db.Project.findOne({
      where: {
        [Sequelize.Op.or]: [
          { custome_domain: subdomain }, // Corrected column name
          { domain: subdomain },
        ],
      },
      attributes: ["id"],
    });

    if (!project) {
      return null;
    }

    const resolveTo = `${BASE_PATH}/${project.id}`;
    return proxy.web(req, res, { target: resolveTo, changeOrigin: true });
  } catch (error) {
    console.error("Error finding project ID by subdomain:", error);
    throw error;
  }
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") {
    proxyReq.path += "index.html";
  }
});
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Reverse Proxy Running...${PORT}`);
});
