
# Arda Hava Durumu Tahmin Uygulaması

Tailwind CSS v3 ile hazırlanmış, sade JavaScript (vanilla JS) kullanan şık bir hava durumu tahmin uygulamasıdır. Bu uygulama, kullanıcıların dünya genelindeki şehirler için gerçek zamanlı hava durumu verilerini, geçmiş bilgileri ve hava tahminlerini görüntülemelerine olanak tanır.

![Arda Weather App](https://via.placeholder.com/800x400?text=Arda+Weather+App)

## Özellikler

- ✅ Open-Meteo API üzerinden gerçek zamanlı hava durumu verileri (API anahtarı gerekmez)
- ✅ Hava durumu verileri her 15 dakikada bir güncellenir
- ✅ Geçmiş veriler için kayıtlar tutulur
- ✅ Geçmiş hava durumu verileri için tarih aralığı seçimi
- ✅ Kullanıcı dostu ve duyarlı tasarıma sahip arayüz
- ✅ Karanlık mod desteği
- ✅ Hava durumu verilerini CSV olarak dışa aktarabilme (sadece yönetici)
- ✅ Veri yönetimi için yönetici kontrolleri

## Teknoloji Yığını

- Uygulama mantığı için Vanilla JavaScript
- Stil için Tailwind CSS v3
- Hava durumu verisi için Open-Meteo API (ücretsiz ve API anahtarı gerekmez)
- Geliştirme ve derleme araçları için Vite
- Simgeler için FontAwesome
- Yazı tipleri için Google Fonts

## Başlarken

### Gereksinimler

- Node.js (v14 veya üstü)
- npm (v6 veya üstü)

### Kurulum

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/your-username/arda-weather.git
   cd arda-weather
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

3. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```

4. Tarayıcınızda `http://localhost:3000` adresini açın

### Üretim için Derleme

1. Uygulamayı derleyin:
   ```bash
   npm run build
   ```

2. Üretim derlemesini önizleyin:
   ```bash
   npm run preview
   ```

## Proje Yapısı

```
arda-weather/
├── public/
│   ├── css/
│   │   └── style.css      # Tailwind kaynak CSS
│   ├── js/
│   │   ├── api.js         # Hava durumu API servisi
│   │   ├── storage.js     # Yerel depolama servisi
│   │   ├── ui.js          # Arayüz yönetimi servisi
│   │   ├── admin.js       # Yönetici işlevleri
│   │   ├── config.js      # Uygulama yapılandırması
│   │   └── app.js         # Ana uygulama kodu
│   └── assets/            # Görseller ve diğer dosyalar
├── main.css               # Vite için CSS giriş noktası
├── main.js                # Vite için JS giriş noktası
├── index.html             # Ana HTML dosyası
├── tailwind.config.js     # Tailwind yapılandırması
├── postcss.config.js      # PostCSS yapılandırması
├── vite.config.js         # Vite yapılandırması
├── package.json           # Proje bağımlılıkları
└── README.md              # Proje dokümantasyonu
```

## Yönetici Erişimi

Uygulama aşağıdaki özelliklere sahip bir yönetici arayüzü içerir:

- Verileri elle yenileme
- Verileri CSV olarak dışa aktarma
- Belirli şehirlerin hava durumu verilerini silme

Yönetici arayüzüne erişmek için:
1. Sağ üstteki "Admin Login" butonuna tıklayın
2. Şu kimlik bilgilerini kullanın:
   - Kullanıcı adı: `admin`
   - Şifre: `admin`

## API Kullanımı

Bu uygulama [Open-Meteo API](https://open-meteo.com/) kullanır. Kayıt ya da API anahtarı gerektirmeyen ücretsiz bir hava durumu servisidir.

Kullanılan Open-Meteo uç noktaları:
- Güncel ve tahmin edilen hava durumu verileri için Hava Durumu Tahmin API'si
- Şehir isimlerini koordinatlara çevirmek için Coğrafi Kodlama API'si

## Proje Tasarımı

Uygulama, çeşitli servislerle modüler bir mimari kullanılarak inşa edilmiştir:

- **WeatherAPI**: Tüm Open-Meteo API çağrılarını yönetir
- **StorageService**: Hava durumu verilerini yerel olarak saklar
- **UIService**: Arayüzü günceller ve yönetir
- **AdminService**: Yöneticiye özel işlevleri sağlar
- **WeatherApp**: Ana uygulama denetleyicisi

## Katkı Sağlama

Katkılar memnuniyetle karşılanır! Pull Request göndermekten çekinmeyin.

## Lisans

Bu proje MIT Lisansı ile lisanslanmıştır - detaylar için LICENSE dosyasına bakın.

## Teşekkürler

- Ücretsiz hava durumu API’si için [Open-Meteo](https://open-meteo.com/)
- CSS çatısı için [Tailwind CSS](https://tailwindcss.com/)
- Derleme araçları için [Vite](https://vitejs.dev/)
- Simgeler için [Font Awesome](https://fontawesome.com/)
- Yazı tipleri için [Google Fonts](https://fonts.google.com/)
