export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageString: string;
};

export type Cart = {
  userId: string;
  items: CartItem[];
};
