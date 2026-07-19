---
id: matchup_controllers_vs_initiators
type: matchup
patch: "13.00"
verified: 2026-07-19
tags: [matchup, controller, initiator, role_fallback]
---

# MATCHUP: Controller vs Initiator

## Ne Oluyor Burada
Initiator'ın işi seni girişten önce bulmak ve sökmek: keşif işaretler, flash körler, sarsıntı savurur. Controller'ın işi bu zinciri değersizleştirmek: keşfin bulduğu pozisyonda olmamak, dalga geçene kadar perdenin arkasında kalmak. Sabit durduğun her round onun round'udur.

## Ucuza Ölüm Kalıpları

**IF**: Üst üste aynı yerden ölüyorsun (repeatedPosition) ve rakip kompta initiator var (enemyComp)
**MEANING**: Keşif yeteneği her round aynı adresi tarıyor ve seni her seferinde buluyor. İşaretli controller takım için en kolay hedeftir — smoke'un nereden geleceği de, nerede durduğun da bilinir.
**COUNTER**: Smoke'larını aynı at ama kendini başka yere koy. Keşfin ilk taradığı hat senin eski pozisyonun — bir hat geriden, farklı bir kenardan aynı açıyı tut.
**WHY**: Keşfin sattığı tek şey konumdur; konum değiştiren controller keşfi bedavaya eskitir.

**IF**: Round'un erken anında öldün (died, deathTiming=erken)
**MEANING**: Açılış-utili dalgasının içine ya da hemen arkasına peek ettin. Initiator'lı takım girişini flash ve sarsıntının üstüne bindirir — o pencerede açıda duran herkes kör ya da savrulmuş nişanla dövüşür.
**COUNTER**: Dalga başladığında açıdan çık, siperde bekle, yetenekler bitince geri gir. Onların girişi dalganın üstünde gelir; senin peek'in dalganın arkasındaki boşlukta gelmeli.
**WHY**: Flash öldürmez — flash'ın açtığı pencerede açıkta durmak öldürür.

**IF**: Öldün ve takım arkadaşın trade'ini alamadı (died, tradedByAlly=false)
**MEANING**: Takımdan kopuk smoke atıyorsun. Perde atarken ekrana bakan controller savunmasızdır; yanında kimse yoksa initiator'ın işaretlediği ilk hedef sensin ve ölümün bedavaya gider.
**COUNTER**: Smoke'larını takımının görüş hattı içinden, siper arkasından at. Perde için açığa çıkman gerekiyorsa önce haber ver — biri senin açını tutsun.
**WHY**: Trade edilmeyen controller ölümü iki kayıptır: oyuncu gider, round'un kalan perdeleri de onunla gider.

## Tekrarlayan Ölüm Ne Anlama Gelir
Initiator'lı kompa sürekli ölüyorsan ritmi yanlış okuyorsun; zincir hiç değişmez: keşif → dalga → giriş. Zincirin ortasında görünür olmayı bırak: keşifte yer değiştir, dalgada siperde kal, giriş anında perden çoktan inmiş ve sen off-angle'da hazır ol.

## Koç Notları
Controller'a karşı initiator'ın tek gerçek hedefi seni erken düşürmektir: controller ölünce takımın perdesi ölür. En değerli alışkanlığın hayatta kalmak — smoke'ların tüfeğinden değerlidir. Rakibin yetenekleri bittiğinde hâlâ ayaktaysan round senin alanında oynanır.
