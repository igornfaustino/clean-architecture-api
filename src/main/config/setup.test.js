const request = require('supertest')
const app = require('./app')

describe('Setup App', () => {
  it('should disabled x-powered-by header', async () => {
    app.get('/test_x_powered_by', (req, res) => res.send(''))

    const res = await request(app).get('/test_x_powered_by')

    expect(res.headers['x-powered-by']).toBeUndefined()
  })

  it('should enable cors', async () => {
    app.get('/test_cors', (req, res) => res.send(''))

    const res = await request(app).get('/test_cors')

    expect(res.headers['access-control-allow-origin']).toBe('*')
    expect(res.headers['access-control-allow-methods']).toBe('*')
    expect(res.headers['access-control-allow-headers']).toBe('*')
  })

  it('should parse body as JSON', async () => {
    app.post('/json_parser', (req, res) => res.send(req.body))

    await request(app)
      .post('/json_parser')
      .send({ name: 'John Doo' })
      .expect({ name: 'John Doo' })
  })
})
