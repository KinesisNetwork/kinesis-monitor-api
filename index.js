const http = require('http')

const NODE0_HOST = process.env.NODE0_HOST || 'node0'
const NODE1_HOST = process.env.NODE1_HOST || 'node1'
const NODE2_HOST = process.env.NODE2_HOST || 'node2'

async function getNodeInfo(host) {
  return new Promise((resolve, reject) => {
    http.get(`http://${host}:11626/info`, (res) => {
      const { statusCode } = res
      const contentType = res.headers['content-type']

      if (statusCode !== 200) {
        // consume response data to free up memory
        res.resume()
        reject(new Error('Invalid status code from node'))
        return
      }

      res.setEncoding('utf8')
      let rawData = ''

      res.on('data', (chunk) => {
        rawData += chunk
      })

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(rawData)
          resolve(parsedData)
        } catch (e) {
          reject(e)
        }
      })
    }).on('error', (e) => {
      reject(e)
    })
  })
}


const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const [node0Info, node1Info, node2Info] = await Promise.all([
      getNodeInfo(NODE0_HOST),
      getNodeInfo(NODE1_HOST),
      getNodeInfo(NODE2_HOST),
    ])

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      node0: node0Info,
      node1: node1Info,
      node2: node2Info,
    }))
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({error: e.message}))
  }
})

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 500 Internal Server Error\r\n\r\n')
})

server.listen(4000)

console.log('Application Booted on Port 4000')
