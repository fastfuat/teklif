# Gadget Trade - Cihaz Teklif Platformu

Bu platform, kullanıcıların ellerindeki cihazları internet üzerinden kolayca satışa sunabileceği, teklif alabileceği çift yönlü bir altyapı sunmaktadır. Next.js, Tailwind CSS ve Supabase teknolojileri ile geliştirilmiştir.

## Özellikler

- **Kullanıcı Tarafı:**
  - Giriş gerektirmeden hızlı teklif alma
  - Kategori, marka, model ve özellik seçme
  - WhatsApp üzerinden otomatik teklif mesajı gönderme

- **Admin Paneli:**
  - Supabase Auth ile güvenli oturum yönetimi
  - Kategoriler, markalar, modeller ve model özellikleri yönetimi
  - Teklif geçmişi görüntüleme ve analiz

## Kurulum

### Ön Gereksinimler

- Node.js 16.x veya üzeri
- npm veya yarn
- Supabase hesabı

### Adımlar

1. Repoyu klonlayın
   ```bash
   git clone <repo-url>
   cd gadget-trade
   ```

2. Bağımlılıkları yükleyin
   ```bash
   npm install
   # veya
   yarn install
   ```

3. `.env.local` dosyasını oluşturun ve Supabase bilgilerinizi ekleyin
   ```
   NEXT_PUBLIC_SUPABASE_URL=<sizin-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<sizin-supabase-anonkey>
   ```

4. Supabase veritabanınızda aşağıdaki tabloları oluşturun:
   - categories (id, name, image_url, created_at)
   - brands (id, name, category_id, image_url, created_at)
   - models (id, name, brand_id, created_at)
   - features (id, name, model_id, options, created_at)
   - quotes (id, category_id, brand_id, model_id, selected_features, contact_number, created_at)

5. Supabase Authentication ayarlarını yapın (sadece email-password auth yeterli)

6. Uygulamayı başlatın
   ```bash
   npm run dev
   # veya
   yarn dev
   ```

## Kullanım

### Kullanıcı Paneli

- Ana sayfadan kategori seçin
- Sırasıyla marka ve model seçin
- Model özelliklerini belirleyin
- "WhatsApp ile Teklif Al" butonuna tıklayın

### Admin Paneli

- `/admin/login` URL'i ile giriş yapın
- Kategoriler, markalar, modeller ve özellikler ekleyip düzenleyin
- Teklif geçmişini görüntüleyin

## Teknolojiler

- Next.js (App Router)
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- TypeScript

## İletişim

Proje ile ilgili sorularınız için iletişime geçebilirsiniz.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
