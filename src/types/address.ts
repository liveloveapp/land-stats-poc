export interface Address {
  id: number;
  details_id: number;
  street_address: string;
  city: string;
  state: string;
  zipcode: string;
  neighborhood: string | null;
  community: string | null;
  subdivision: string | null;
}
