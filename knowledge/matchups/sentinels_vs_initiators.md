---
id: matchup_sentinels_vs_initiators
type: matchup
patch: "13.00"
verified: 2026-07-19
tags: [matchup, sentinel, initiator, role_fallback]
---

# MATCHUP: Sentinel vs Initiator

## Ne Oluyor Burada
Initiator'ın kiti doğrudan senin kurulumuna karşı yazılmıştır: keşif seni ve cihazlarını işaretler, flash-sarsıntı dalgası çapanı söker, giriş tam arkasından gelir. Senin kazanma yolun kurulumun kendisi değil, kurulumun okunmazlığı — her round aynı fotoğrafı veren sentinel, initiator için çözülmüş bulmacadır.

## Ucuza Ölüm Kalıpları

**IF**: Üst üste aynı yerde ölüyorsun (repeatedPosition)
**MEANING**: Keşif seni her round aynı setup'ta buluyor. Initiator artık taramıyor, doğruluyor: cihazın yeri, senin köşen, hepsi ezberde.
**COUNTER**: Setup'ını her round değiştir — cihazların yerini, kendi çapanı ya da en azından ikisinin arasındaki bağı. Keşfin ilk taradığı yer bir önceki round'un fotoğrafıdır; sen o karede olma.
**WHY**: Sabit kurulum okunur; okunan sentinel, keşfe gerek bile bırakmaz.

**IF**: Erken öldün (died, deathTiming=erken)
**MEANING**: Açılış dalgasının içinde çapa açısında durdun — keşfin işaretlediği, flash'ın körlediği pencerede takım tam üstüne girdi.
**COUNTER**: Dalga başladığında açıyı bırak, bir hat geriye çekil, cihazlarının verdiği bilgiyle ikinci hattan dövüş. Kurulumun ilk hattı yavaşlatır; senin işin ilk hatta ölmek değil, ikinci hatta bitirmek.
**WHY**: Utility dalgası çapayı sökmek için atılır; dalgaya direnen değil, dalgayı boşa aldıran sentinel kazanır.

**IF**: Çapadayken öldün ve takımın hâlâ kalabalıktı (died, alliesAlive yüksek)
**MEANING**: Site'ı tek başına tutmaya çalıştın — oysa takım ayaktayken çapayı bırakmak kayıp değil, sayı korumaktır: geri çekilseydin site'ı birlikte geri alırdınız.
**COUNTER**: Utility zinciri site'ına döküldüğünde kararı alliesAlive'a bağla: takım ayaktaysa zaman sat, geri çekil, birlikte geri al; son kalanlardansan ancak o zaman açıyı sonuna kadar tut.
**WHY**: Sentinel'in değeri sayıdadır — yaşayan sentinel kurulumunu yeniden kurar, ölen sentinel'in cihazları sahipsiz kalır.

## Tekrarlayan Ölüm Ne Anlama Gelir
Initiator'lı kompa sürekli ölüyorsan zincirle savaşıyorsun demektir; sıra hiç değişmez: keşif → dalga → giriş. Zincirin karşısında değil dışında dur: keşifte yer değiştir, dalgada geri çekil, giriş uzadığında tekrar sıkıştır.

## Koç Notları
Initiator'a karşı sentinel matematiği basittir: onun her sökme hamlesi yetenek harcar, senin kurulumun sonraki round bedava yenilenir. Round uzadıkça eli boşalan taraf o olur — dalgayı savuşturduysan rakibin en zayıf anı yetenekleri bittiği andır: o pencerede cihazlarının arkasından sıkıştır, düelloyu kendi kurduğun açıda ver.

## Clove Varsa: Diriliş Penceresi

Düşman kompunda Clove varsa Clove üzerine aldığın kill'i teyit etmeden sayma: Clove kendini diriltebilir ve hep bedeninin olduğu adreste kalkar. Dirilen Clove süre içinde kill ya da hasar çıkaramazsa kendiliğinden ölür — o pencerede panik peek atma, geri çekil ve temas verme; beden açısını gövdenle değil cihazınla tut, süre onu senin yerine bitirir. Clove öldükten sonra bile smoke atar: o perde ezberden ve sesten beslenir — ses disiplinini koru ki duman yanlış adrese insin; ölü Clove'un dumanına canlı controller tepkisi diye oynama.
