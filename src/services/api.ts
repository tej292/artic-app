import type { ApiResponse } from '../types';

const BASE = 'https://api.artic.edu/api/v1/artworks';

export async function fetchArtworks(page: number, limit: number) : Promise<ApiResponse> {
  const fields = [
    'id',
    'title',
    'place_of_origin',
    'artist_display',
    'inscriptions',
    'date_start',
    'date_end'
  ].join(',');

  const url = `${BASE}?page=${page}&limit=${limit}&fields=${fields}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  // The API returns pagination info in "pagination"
  return json as ApiResponse;
}
