const heroSchema = {
  title: { type: 'string', required: true },
  subtitle: { type: 'string', required: true },
  description: { type: 'string', required: true },
  imageUrl: { type: 'string', required: true },
  buttonText: { type: 'string', required: true },
  buttonLink: { type: 'string', required: true },
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

module.exports = heroSchema;