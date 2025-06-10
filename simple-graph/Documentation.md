# Restaurant Graph popoto.js dengan Peta

> **Catatan:** Data restoran yang ditampilkan pada aplikasi ini hanya mencakup restoran yang berlokasi di **Pekanbaru**.

Contoh lanjutan dari [Popoto.js](http://popotojs.com/) yang mengintegrasikan banyak fitur: visualisasi graph interaktif, navigasi taksonomi, penampil query, dan pemetaan geografis.

## Fitur

### 1. Visualisasi Graph
- Visualisasi graph Neo4j interaktif untuk data restoran
- Eksplorasi visual hubungan antara restoran, kategori, dan jam buka
- Tampilan node yang dikustomisasi dan interaksi pengguna

### 2. Navigasi Taksonomi
- Struktur kategori restoran secara hierarkis:
  - Restaurant (root)
- Navigasi mudah melalui kategori restoran
- Tampilan detail restoran yang diperluas pada hasil pencarian

### 3. Penampil Query
- Visualisasi query Cypher secara real-time
- Dua tampilan query yang saling melengkapi:
  - Generated Query: Menampilkan query Cypher yang dihasilkan dengan highlight sintaks
  - Executable Cypher: Menampilkan query Cypher mentah yang bisa dieksekusi

### 4. Integrasi Peta Geografis
- Peta interaktif MapBox yang menampilkan lokasi restoran
- Marker khusus untuk setiap restoran yang memiliki data lokasi
- Hasil pencarian dapat diklik untuk terbang ke lokasi pada peta
- Popup dengan detail restoran
- Visualisasi gedung 3D untuk konteks geografis

## Cara Penggunaan

1. **Navigasi Taksonomi**: Klik pada node kategori di panel kiri untuk mengeksplorasi tipe restoran tertentu
2. **Eksplorasi Graph**: Interaksi dengan visualisasi graph untuk membangun query dan eksplorasi relasi
3. **Lihat Query yang Dihasilkan**: Lihat query Cypher yang dihasilkan dari interaksi Anda di penampil query
4. **Eksplorasi Data Geografis**: Lihat lokasi restoran di peta dan klik marker untuk detail
5. **Klik Hasil**: Klik pada hasil restoran untuk terbang ke lokasi mereka di peta

## Implementasi Teknis

- Menggunakan database graph Neo4j untuk menyimpan data restoran
- Popoto.js untuk visualisasi graph dan pembuatan query
- D3.js untuk rendering visualisasi
- MapBox GL JS untuk peta interaktif
- CSS Grid untuk layout responsif

## Model Data

Aplikasi ini menggunakan tipe node Neo4j berikut:
- `Restaurant`: Menyimpan detail restoran (title, address, koordinat lokasi, dll)
- `Category`: Menyimpan kategori dan subkategori restoran
- `OpeningHour`: Menyimpan jam operasional restoran

## Database Schema

### Node: Restaurant
| Attribute                       | Type    |
|---------------------------------|---------|
| totalScore                      | FLOAT   |
| phone                           | STRING  |
| imageUrl                        | STRING  |
| street                          | STRING  |
| state                           | STRING  |
| reviewsDistribution_fourStar    | INTEGER |
| reviewsCount                    | INTEGER |
| city                            | STRING  |
| categoryName                    | STRING  |
| title                           | STRING  |
| rank                            | INTEGER |
| reviewsDistribution_fiveStar    | INTEGER |
| postalCode                      | STRING  |
| description                     | STRING  |
| location_lat                    | FLOAT   |
| website                         | STRING  |
| countryCode                     | STRING  |
| permanentlyClosed               | BOOLEAN |
| reviewsDistribution_oneStar     | INTEGER |
| url                             | STRING  |
| price                           | STRING  |
| location_lng                    | FLOAT   |
| address                         | STRING  |
| reviewsDistribution_threeStar   | INTEGER |
| language                        | STRING  |
| reviewsDistribution_twoStar     | INTEGER |

**Relationships:**
- `HAS_OPENING_HOUR` → OpeningHour
- `HAS_CATEGORY` → Category

### Node: Category
| Attribute | Type   |
|-----------|--------|
| name      | STRING |

### Node: OpeningHour
| Attribute | Type   |
|-----------|--------|
| hours     | STRING |
| day       | STRING |

