import { yt_tracksplitter, setBasePath, getVideoInfo } from "./main";
import {Observable} from 'rxjs';

const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


let clients = [];

function sendEventsToAll(newNest) {
  clients.forEach(c => c.res.write(JSON.stringify(newNest)))
}


app.get('/info', (req,res) => {
  res.write(JSON.stringify(getVideoInfo(req.body.v)));
});

app.post("/download", (req, res) => {
  console.log(req.body);
  yt_tracksplitter(req.body).subscribe((event) => sendEventsToAll(event), null, () => {
      clients.forEach((c) => c.res.end());
  });
  res.send(JSON.stringify({}));
});

app.get("/events", (req, res) => {
  // Mandatory headers and http status to keep connection open
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders(); // flush the headers to establish SSE with client
  
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);
  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

