import { Router, Request, Response } from 'express';
import { products } from '../data/store';

const router = Router();

// GET /api/products
router.get('/', (req: Request, res: Response) => {
  const { search, category, brand, schemeEligible, sort } = req.query;

  let result = [...products];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }

  if (category && typeof category === 'string' && category !== 'all') {
    result = result.filter((p) => p.category === category);
  }

  if (brand && typeof brand === 'string' && brand !== 'all') {
    result = result.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (schemeEligible === 'true') {
    result = result.filter((p) => p.schemeEligible);
  }

  if (sort === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  }

  res.json({
    success: true,
    total: result.length,
    data: result,
  });
});

// GET /api/products/:id
router.get('/:id', (req: Request, res: Response) => {
  const product = products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

export default router;
