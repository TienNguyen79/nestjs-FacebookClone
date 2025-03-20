type Tpaginate<T> = {
  page?: number;
  limit?: number;
} & T;
