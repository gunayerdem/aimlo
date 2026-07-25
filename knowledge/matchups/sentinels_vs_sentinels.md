---
id: matchup_sentinels_vs_sentinels
type: matchup
patch: "13.00"
verified: 2026-07-19
tags: [matchup, sentinel, mirror, role_fallback]
---

# MATCHUP: Sentinel vs Sentinel

## Ne Oluyor Burada
İki kurulum, iki sabır. Kimse girmek istemiyor; round'u ya rakibini sabırsızlığa zorlayan ya da ekonomiyi daha temiz yöneten taraf alır. Ayna eşleşmede en pahalı hata zorlama düellodur — hatayı ilk yapan, round'u çoğunlukla oracıkta verir.

## Ucuza Ölüm Kalıpları

**IF**: Erken öldün (died, deathTiming=erken)
**MEANING**: Sabır savaşını ilk sen bozdun — kurulmuş bir hattın, hazır bir cihaz düzeninin üstüne yürüdün. İki sentinel'li round'da erken temas neredeyse her zaman kurulan tarafın lehinedir.
**COUNTER**: Erken temas arama. Rakibin kurulumu da senin gibi ilk dokunuşu bekliyor — dokunmayı utility'ye bırak, tüfeği kurulum söküldükten sonra konuştur.
**WHY**: Kurulum kurulumla değil, sabırla ve utility'yle sökülür; erken yürüyen taraf iki kurulumdan da cezayı yer.

**IF**: Eko ya da yarı alım round'unda öldün (died, economyType)
**MEANING**: Zayıf silahla kurulmuş düzenin üstüne dövüş kabul ettin. Ayna eşleşmede asıl savaş ekonomi savaşıdır: iki taraf da yavaş oynadığı için silah farkı düelloları tek başına belirler.
**COUNTER**: Zayıf eldeyken düello arama — zaman sat, cihazlarını rakibe utility harcatmak için kullan, silahını yaşatıp sonraki round'a tam alımla çık.
**WHY**: Sentinel aynasında round'lar tek tek değil seri kazanılır; ekonomisini koruyan taraf seriyi alır.

**IF**: Rakip kompta Sage var (enemyComp)
**MEANING**: Sage ayaktayken düşürdüğün hiçbir rakip kesin kayıp değildir — düşen oyuncu bedeninin olduğu yerde ayağa kaldırılır ve düello aynı noktada yeniden başlar.
**COUNTER**: Rakip düşürdüğünde açıyı hemen terk etme, üstünden de körü körüne geçme: ayağa kalkma açısını bir an tut ve dirileni kalkış anında düşür; geçmen gerekiyorsa eski açına cihaz bırak.
**WHY**: Diriltme hep aynı adreste olur; o adresi tutan ya da tuzaklayan sentinel aynı düelloyu iki kez kazanır.

## Tekrarlayan Ölüm Ne Anlama Gelir
Ayna eşleşmede sürekli ölüyorsan sabırsız taraf sensin: rakip kurulumuna, rakip temposuna, rakip saatine oynuyorsun. Üstüne bir de aynı pozisyonda üst üste öldüysen (repeatedPosition) okunuyorsun demektir — kurulumunu ve çapanı her round kaydır.

## Koç Notları
Sentinel aynasında kazanan, düelloyu en az veren taraftır. Saat kimin lehineyse o beklesin: savunmadaysan saat zaten senin; saldırıdaysan yavaşlığı plansızlıkla karıştırma — yavaş başla ama execute'u tek dalgada, utility'yle bitir. Ve unutma: iki kurulumlu round'da en değerli bilgi rakibin nerede OLMADIĞIDIR — cihazının sessizliği de bilgidir.

## Clove Varsa: Diriliş Penceresi

Düşman kompunda Clove varsa Clove üzerine aldığın kill'i teyit etmeden sayma: Clove kendini diriltebilir ve hep bedeninin olduğu adreste kalkar. Dirilen Clove süre içinde kill ya da hasar çıkaramazsa kendiliğinden ölür — o pencerede panik peek atma, geri çekil ve temas verme; beden açısını gövdenle değil cihazınla tut, süre onu senin yerine bitirir. Clove öldükten sonra bile smoke atar: o perde ezberden ve sesten beslenir — ses disiplinini koru ki duman yanlış adrese insin; ölü Clove'un dumanına canlı controller tepkisi diye oynama.
