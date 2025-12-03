import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';

async function registerUser(label) {
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

async function createListedItem(token, overrides = {}) {
  const createRes = await request(app)
    .post('/api/me/items')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Listed Item',
      category: 'Misc',
      condition: 'Good',
      description: 'Ready to trade',
      image: 'https://picsum.photos/seed/listings/200/200',
      ...overrides,
    })
    .expect(201);

  const itemId = createRes.body.item.id;
  await request(app)
    .post(`/api/me/items/${itemId}/listing`)
    .set('Authorization', `Bearer ${token}`)
    .send({ offerType: 'swap' })
    .expect(200);
  return itemId;
}

describe('Listings service', () => {
  it('does not return my own listings when browsing', async () => {
    const owner = await registerUser('owner');
    await createListedItem(owner.token, { title: 'Owner Item' });

    const res = await request(app)
      .get('/api/listings')
      .set('Authorization', `Bearer ${owner.token}`)
      .expect(200);

    expect(res.body.items).to.have.length(0);
  });

  it('shows seller info on listing detail', async () => {
    const seller = await registerUser('seller');
    const listingId = await createListedItem(seller.token, { title: 'Camera' });

    const res = await request(app).get(`/api/listings/${listingId}`).expect(200);
    expect(res.body.item).to.include.keys('ownerName', 'ownerPhoto');
    expect(res.body.item.title).to.equal('Camera');
  });
});
