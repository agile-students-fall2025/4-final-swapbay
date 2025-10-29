export const mockMyOffers = [
  {
    id: 8001,
    status: 'Pending',             // 'Pending' | 'Accepted' | 'Rejected' | 'Canceled'
    offerType: 'money',            // 'money' | 'swap' | 'both'
    amount: 80,                    // used for money/both
    myItemId: 3,                   // <-- must match an item in mockUserItems
    myItem: {
      id: 3,
      title: 'Gaming Laptop',
      category: 'Computers',
      condition: 'Used',
      description: '16GB RAM • RTX 3060 • 512GB SSD',
      image: 'https://picsum.photos/seed/laptop/400/300',
    },
    target: {
      title: 'Mountain Bike',
      sellerUsername: 'hailemariam',
      category: 'Sports',
      condition: 'Good',
      description: 'Sturdy frame and new tires.',
      image: 'https://picsum.photos/seed/bike/600/400',
    },
  },

  {
    id: 8002,
    status: 'Pending',
    offerType: 'swap',
    myItemId: 1,
    myItem: {
      id: 1,
      title: 'Bluetooth Headphones',
      category: 'Electronics',
      condition: 'Like New',
      description: 'Comfortable wireless headphones with crisp sound.',
      image: 'https://picsum.photos/seed/headphones/600/400',
    },
    target: {
      title: 'Canon EOS 250D',
      sellerUsername: 'meron',
      category: 'Electronics',
      condition: 'Like New',
      description: 'Compact DSLR with 18–55mm kit lens.',
      image: 'https://picsum.photos/seed/camera/600/400',
    },
  },

  {
    id: 8003,
    status: 'Rejected',
    offerType: 'both',
    amount: 50,
    myItemId: 1,
    myItem: {
      id: 1,
      title: 'Bluetooth Headphones',
      category: 'Electronics',
      condition: 'Like New',
      description: 'Comfortable wireless headphones with crisp sound.',
      image: 'https://picsum.photos/seed/headphoneX/600/400',
    },
    target: {
      title: 'Smart Watch',
      sellerUsername: 'biruk',
      category: 'Wearables',
      condition: 'Good',
      description: 'Water-resistant, fitness tracking.',
      image: 'https://picsum.photos/seed/watch/600/400',
    },
  },

  {
    id: 8004,
    status: 'Accepted',
    offerType: 'swap',
    myItemId: 2,
    myItem: {
      id: 2,
      title: 'Mountain Bike',
      category: 'Sports',
      condition: 'Good',
      description: 'Trail-ready, recently serviced.',
      image: 'https://picsum.photos/seed/bikeyours/600/400',
    },
    target: {
      title: 'GoPro Hero 10',
      sellerUsername: 'yonas',
      category: 'Cameras',
      condition: 'Like New',
      description: '5.3K video, waterproof housing.',
      image: 'https://picsum.photos/seed/gopro10/600/400',
    },
  },
];

