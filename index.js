const express = require('express')

const app = express()
const port = 5000 || process.env.port

app.listen(port, () => console.log(`Listening on port ${port}..`))