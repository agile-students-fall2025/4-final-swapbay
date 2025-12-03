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
      image: 'https://picsum.photos/seed/offers/200/200',
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

describe('Offers routes', () => {
  it('creates and fetches offers for buyer and seller', async () => {
    const seller = await registerUser('seller');
    const listingId = await createListedItem(seller.token, { title: 'Console' });

    const buyer = await registerUser('buyer');
    const offerRes = await request(app)
      .post('/api/offers')
      .set('Authorization', `Bearer ${buyer.token}`)
      .send({ listingId, offerType: 'money', amount: 50 })
      .expect(201);

    expect(offerRes.body.offer).to.include({ status: 'Pending', offerType: 'money' });

    const outgoingRes = await request(app)
      .get('/api/offers/outgoing')
      .set('Authorization', `Bearer ${buyer.token}`)
      .expect(200);
    expect(outgoingRes.body.offers).to.have.length(1);

    const incomingRes = await request(app)
      .get('/api/offers/incoming')
      .set('Authorization', `Bearer ${seller.token}`)
      .expect(200);
    expect(incomingRes.body.offers).to.have.length(1);

    await request(app)
      .post(`/api/offers/${offerRes.body.offer.id}/reject`)
      .set('Authorization', `Bearer ${seller.token}`)
      .expect(200);
  });
});
