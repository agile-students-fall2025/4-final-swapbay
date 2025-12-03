import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

async function registerUser(label = 'listing') {
  const unique = `${label}${Date.now()}`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: `${label} user`,
      username: unique,
      email: `${unique}@example.com`,
      password: 'password123',
    })
    .expect(201);
  return { token: res.body.token, user: res.body.user };
}

async function createPublicListing(token, overrides = {}) {
  const createRes = await request(app)
    .post('/api/me/items')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Public Item',
      category: 'Misc',
      condition: 'Good',
      description: 'A public item',
      image: 'https://picsum.photos/seed/listing/200/200',
      ...overrides,
    })
    .expect(201);
  const itemId = createRes.body.item.id;
  await request(app)
    .post(`/api/me/items/${itemId}/listing`)
    .set('Authorization', `Bearer ${token}`)
    .send({ offerType: 'both' })
    .expect(200);
  return itemId;
}

describe('Listings routes', () => {
  it('returns public listings and listing detail', async () => {
    const { token } = await registerUser('seller');
    const listingId = await createPublicListing(token, { title: 'Mountain Bike' });

    const listRes = await request(app).get('/api/listings').expect(200);
    expect(listRes.body.items).to.have.length(1);
    expect(listRes.body.items[0]).to.include({ title: 'Mountain Bike', status: 'public' });

    const detailRes = await request(app).get(`/api/listings/${listingId}`).expect(200);
    expect(detailRes.body.item).to.include({ id: listingId, title: 'Mountain Bike' });
  });

  it('returns offers for a listing', async () => {
    const { token } = await registerUser('offer-seller');
    const listingId = await createPublicListing(token, { title: 'Laptop' });

    const offersRes = await request(app).get(`/api/listings/${listingId}/offers`).expect(200);
    expect(offersRes.body.item.title).to.equal('Laptop');
    expect(offersRes.body.offers).to.be.an('array');
  });
});
