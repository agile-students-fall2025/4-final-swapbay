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
      description: 'Ready for offers',
      image: 'https://picsum.photos/seed/offers-service/200/200',
      ...overrides,
    })
    .expect(201);
  const itemId = createRes.body.item.id;
  await request(app)
    .post(`/api/me/items/${itemId}/listing`)
    .set('Authorization', `Bearer ${token}`)
    .send({ offerType: 'money' })
    .expect(200);
  return itemId;
}

describe('Offers service', () => {
  it('prevents making an offer on my own listing', async () => {
    const seller = await registerUser('self-seller');
    const listingId = await createListedItem(seller.token, { title: 'Own Item' });

    const res = await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${seller.token}`)
      .send({ listingId, offerType: 'money', amount: 10 })
      .expect(400);

    expect(res.body.message).to.match(/own listing/i);
  });

  it('accepts an offer and updates status', async () => {
    const seller = await registerUser('seller');
    const listingId = await createListedItem(seller.token, { title: 'Board Game' });

    const buyer = await registerUser('buyer');
    const offerRes = await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${buyer.token}`)
      .send({ listingId, offerType: 'money', amount: 30 })
      .expect(201);

    const accepted = await request(app)
      .post(`/api/offers/${offerRes.body.offer.id}/accept`)
      .set('Authorization', `Bearer ${seller.token}`)
      .expect(200);

    expect(accepted.body.offer.status).to.equal('Accepted');
    expect(accepted.body.listing.status).to.equal('private');
  });
});
