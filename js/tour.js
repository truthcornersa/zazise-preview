(function () {
  "use strict";

  var tag = document.currentScript;
  var page = tag && tag.getAttribute("data-tour");
  if (page !== "preview" && page !== "watch" && page !== "clips") return;

  var KEY = "zazise.tour." + page;
  var dismissed = false;
  try { dismissed = localStorage.getItem(KEY) === "1"; } catch (e) {}
  if ((page === "watch" || page === "clips") && dismissed) return;

  var COPY = {
    en: {
      skip: "Skip", back: "Back", next: "Next", done: "Done", again: "Don't show this again",
      p: [
        ["Welcome to ZAZISE", "A short look around your home. You can skip this any time."],
        ["Languages", "Switch the preview into the language you speak."],
        ["Search", "Look for a show, a creator, or a topic."],
        ["Menu", "Home, trending, clips and the rest live in this menu."],
        ["Trending", "Open a show from this row."],
        ["Getting around", "On a phone, this bar moves you around. On a bigger screen, your profile sits up top."],
        ["You're set", "Turn this on if you don't want the tour again, then tap Done."]
      ],
      w: [
        ["Watching on ZAZISE", "A short look at this screen. Skip whenever you like."],
        ["The player", "Press play in the middle. Full screen is on the player bar."],
        ["Up next", "More videos sit just under the player."],
        ["Like, share, save", "Use these once the video is open."],
        ["The creator", "Subscribe here if you want more from this channel."],
        ["Languages", "The same language bar works on this screen too."],
        ["You're set", "Turn this on if you don't want the tour again, then tap Done."]
      ],
      c: [
        ["Clips", "A short look at Clips. You can skip this any time."],
        ["The clip", "Tap once to pause. Tap again and again to send hearts."],
        ["Search", "Find a clip. The page stays put while you type."],
        ["Go live", "Live sits up here. It is not open yet."],
        ["Actions", "Like, comment, share and sound sit on the side."],
        ["Follow", "Follow a creator from the name on the clip."],
        ["You're set", "Turn this on if you don't want the tour again, then tap Done."]
      ]
    },
    af: {
      skip: "Slaan oor", back: "Terug", next: "Volgende", done: "Klaar", again: "Moenie dit weer wys nie",
      p: [
        ["Welkom by ZAZISE", "’n Kort kykie rondom jou tuisblad. Jy kan enige tyd oorslaan."],
        ["Tale", "Skakel die voorskou oor na die taal wat jy praat."],
        ["Soek", "Soek ’n program, ’n skepper, of ’n onderwerp."],
        ["Kieslys", "Tuis, gewild, snitte en die res is in hierdie kieslys."],
        ["Gewild", "Maak ’n program uit hierdie ry oop."],
        ["Beweeg rond", "Op ’n foon beweeg hierdie balk jou rond. Op ’n groter skerm sit jou profiel bo."],
        ["Jy is gereed", "Skakel dit aan as jy die toer nie weer wil sien nie, en tik dan Klaar."]
      ],
      w: [
        ["Kyk op ZAZISE", "’n Kort kykie na hierdie skerm. Slaan oor wanneer jy wil."],
        ["Die speler", "Druk speel in die middel. Volskerm is op die spelerbalk."],
        ["Volgende", "Nog video’s sit net onder die speler."],
        ["Hou van, deel, stoor", "Gebruik hierdie sodra die video oop is."],
        ["Die skepper", "Teken hier in as jy meer van hierdie kanaal wil hê."],
        ["Tale", "Dieselfde taalbalk werk ook op hierdie skerm."],
        ["Jy is gereed", "Skakel dit aan as jy die toer nie weer wil sien nie, en tik dan Klaar."]
      ],
      c: [
        ["Snitte", "’n Kort kykie na Snitte. Jy kan enige tyd oorslaan."],
        ["Die snit", "Tik een keer om te wag. Tik weer en weer om hartjies te stuur."],
        ["Soek", "Vind ’n snit. Die bladsy bly staan terwyl jy tik."],
        ["Gaan lewendig", "Lewendig sit hier bo. Dit is nog nie oop nie."],
        ["Aksies", "Hou van, lewer kommentaar, deel en klank sit aan die kant."],
        ["Volg", "Volg ’n skepper by die naam op die snit."],
        ["Jy is gereed", "Skakel dit aan as jy die toer nie weer wil sien nie, en tik dan Klaar."]
      ]
    },
    zu: {
      skip: "Yeqa", back: "Emuva", next: "Okulandelayo", done: "Kuqediwe", again: "Ungaphindi ukubonisa lokhu",
      p: [
        ["Wamukelekile ku-ZAZISE", "Ukubuka okufushane ekhaya lakho. Ungayeqa noma nini."],
        ["Izilimi", "Shintsha ukubuka ulimi olukhulumayo."],
        ["Sesha", "Funa uhlelo, umdali, noma isihloko."],
        ["Imenyu", "Ikhaya, okuthandwayo, iziqeshana nokunye kukule menyu."],
        ["Okuthandwayo", "Vula uhlelo kule rayi."],
        ["Ukuzulazula", "Efowini leli bha likuhambisa. Esikrinini esikhulu iphrofayela yakho iphezulu."],
        ["Usulungele", "Vula lokhu uma ungafuni uhambo futhi, bese uthinta Kuqediwe."]
      ],
      w: [
        ["Ukubuka ku-ZAZISE", "Ukubuka okufushane kulesi sikrini. Yeqa noma nini."],
        ["Isidlali", "Cindezela dlala maphakathi. Iskrini esigcwele sisebha yesidlali."],
        ["Okulandelayo", "Amanye amavidiyo angaphansi kwesidlali."],
        ["Thanda, yabelana, gcina", "Sebenzisa lokhu uma ividiyo isivuliwe."],
        ["Umdali", "Bhalisa lapha uma ufuna okwengeziwe kulesi siteshi."],
        ["Izilimi", "Ibha yezilimi iyasebenza nalesi sikrini."],
        ["Usulungele", "Vula lokhu uma ungafuni uhambo futhi, bese uthinta Kuqediwe."]
      ],
      c: [
        ["Iziqeshana", "Ukubuka okufushane kweziqeshana. Ungayeqa noma nini."],
        ["Isiqeshana", "Thepha kanye ukuze umise. Thepha futhi futhi ukuze uthumele izinhliziyo."],
        ["Sesha", "Thola isiqeshana. Ikhasi lihlala njengoba uthayipha."],
        ["Bukhoma", "Okubukhoma kukhona lapha phezulu. Akukavulwa."],
        ["Izenzo", "Thanda, phawula, yabelana nomsindo kusehlangothini."],
        ["Landela", "Landela umdali egameni elisesiqeshaneni."],
        ["Usulungele", "Vula lokhu uma ungafuni uhambo futhi, bese uthinta Kuqediwe."]
      ]
    },
    xh: {
      skip: "Tsiba", back: "Emva", next: "Okulandelayo", done: "Kugqityiwe", again: "Ungaphindi ukubonisa oku",
      p: [
        ["Wamkelekile ku-ZAZISE", "Ukujonga okufutshane ekhayeni lakho. Ungatsiba nanini na."],
        ["Iilwimi", "Tshintsha ujongo kulwimi oluthethayo."],
        ["Khangela", "Khangela umboniso, umdali, okanye isihloko."],
        ["Imenyu", "Ekhaya, ekuthandwayo, iziqwengana nezinye zikule menyu."],
        ["Ekuthandwayo", "Vula umboniso kweli linge."],
        ["Ukuhamba", "Kwifowuni le bar ikuhambisa. Kwisikrini esikhulu iprofayile yakho ingaphezulu."],
        ["Ulungile", "Vula oku ukuba awufuni uhambo kwakhona, uze ucofe Kugqityiwe."]
      ],
      w: [
        ["Ukubukela ku-ZAZISE", "Ukujonga okufutshane kwesi skrini. Tsiba nanini na."],
        ["Isidlali", "Cofa dlala embindini. Iskrini esizeleyo sikwibar yesidlali."],
        ["Okulandelayo", "Ezinye iividiyo ziphantsi kwesidlali."],
        ["Thanda, yabelana, gcina", "Sebenzisa ezi xa ividiyo ivuliwe."],
        ["Umdali", "Bhalisa apha ukuba ufuna okungakumbi kwesi siteshi."],
        ["Iilwimi", "Ibar yeelwimi iyasebenza nakwesi skrini."],
        ["Ulungile", "Vula oku ukuba awufuni uhambo kwakhona, uze ucofe Kugqityiwe."]
      ],
      c: [
        ["Iziqwengana", "Ukujonga okufutshane kweziqwengana. Ungatsiba nanini na."],
        ["Isiqwengana", "Cofa kanye ukuze umise. Cofa kwakhona ukuze uthumele iintliziyo."],
        ["Khangela", "Fumana isiqwengana. Iphepha lihlala ngelixa uchwetheza."],
        ["Bukhoma", "Ubomi buhleli apha phezulu. Alikavulwa."],
        ["Izenzo", "Thanda, phawula, yabelana nesandi kuhleli ecaleni."],
        ["Landela", "Landela umdali kwigama elikwisiqwengana."],
        ["Ulungile", "Vula oku ukuba awufuni uhambo kwakhona, uze ucofe Kugqityiwe."]
      ]
    },
    st: {
      skip: "Tlola", back: "Morao", next: "E latelang", done: "Phethile", again: "Se ke bontše hape",
      p: [
        ["O amohelehile ho ZAZISE", "Sheba hanyane ka tlung la hao. O ka tlola neng kapa neng."],
        ["Dipuo", "Fetola pontsho puong eo o e buang."],
        ["Batla", "Batla lenaneo, moqapi, kapa sehlooho."],
        ["Lenane", "Lehae, tse tummeng, dikaroloana le tse ding di lenaneng lena."],
        ["Tse tummeng", "Bula lenaneo moleng ona."],
        ["Ho tsamaya", "Founong bara ena e o tsamaisa. Sekrineng se seholo profaele ya hao e hodimo."],
        ["O lokile", "Bula sena ha o sa batle leeto hape, ebe o tobetsa Phethile."]
      ],
      w: [
        ["Ho shebella ho ZAZISE", "Sheba hanyane skrineng sena. Tlola ha o batla."],
        ["Sebapali", "Tobetsa bapala bohareng. Skrine se tletseng se bareng ya sebapali."],
        ["E latelang", "Divideo tse ding di ka tlasa sebapali."],
        ["Rata, arolelana, boloka", "Sebedisa tsena ha video e butswe."],
        ["Moqapi", "Ingodise mona ha o batla tse ding tsa kanale ena."],
        ["Dipuo", "Bara ya dipuo e sebetsa le skrineng sena."],
        ["O lokile", "Bula sena ha o sa batle leeto hape, ebe o tobetsa Phethile."]
      ],
      c: [
        ["Dikaroloana", "Sheba hanyane dikaroloaneng. O ka tlola neng kapa neng."],
        ["Karoloana", "Tobetsa hang ho emisa. Tobetsa hape le hape ho romela dipelo."],
        ["Batla", "Fumana karoloana. Leqephe le dula ha o ntse o ngola."],
        ["Ka ho toba", "Ho toba ho lutse mona hodimo. Ha e so bulehe."],
        ["Diketso", "Rata, fana ka maikutlo, arolelana le modumo di ka lehlakoreng."],
        ["Latela", "Latela moqapi lebitso le holim'a karoloana."],
        ["O lokile", "Bula sena ha o sa batle leeto hape, ebe o tobetsa Phethile."]
      ]
    },
    tn: {
      skip: "Tlolola", back: "Morago", next: "E e latelang", done: "Go fedile", again: "Se bontshe seno gape",
      p: [
        ["O amogetswe mo ZAZISE", "Leba ka bokhutshwane mo lapeng la gago. O ka tlolela nako nngwe le nngwe."],
        ["Dipuo", "Fetola tebelelo go puo e o e buang."],
        ["Batla", "Batla lenaneo, modiri, kgotsa setlhogo."],
        ["Lenaneo", "Gae, tse di tumileng, dikarolwana le tse dingwe di mo lenaneong le."],
        ["Tse di tumileng", "Bula lenaneo mo moleng o."],
        ["Go tsamaya", "Mo mogaleng bara e e go tsamaisa. Mo sekirining se segolo porofaele ya gago e kwa godimo."],
        ["O siame", "Bula seno fa o sa batle loeto gape, mme o tobetse Go fedile."]
      ],
      w: [
        ["Go lebelela mo ZAZISE", "Leba ka bokhutshwane mo sekirining se. Tlolola fa o batla."],
        ["Sebapadi", "Tobetsa bapala fa gare. Sekirini se se tletseng se mo bareng ya sebapadi."],
        ["E e latelang", "Divideo tse dingwe di ka fa tlase ga sebapadi."],
        ["Rata, abelana, boloka", "Dirisa tseno fa video e butswe."],
        ["Modiri", "Ikwadise fa fa o batla tse dingwe tsa kanale eno."],
        ["Dipuo", "Bara ya dipuo e dira le mo sekirining se."],
        ["O siame", "Bula seno fa o sa batle loeto gape, mme o tobetse Go fedile."]
      ],
      c: [
        ["Dikarolwana", "Leba ka bokhutshwane mo dikarolwaneng. O ka tlolela nako nngwe le nngwe."],
        ["Karolwana", "Tobetsa gangwe go ema. Tobetsa gape le gape go romela dipelo."],
        ["Batla", "Bona karolwana. Tsebe e nna fa o ntse o kwala."],
        ["Ka namana", "Go nna ka namana go fa godimo. Ga e ise e bulwe."],
        ["Ditiro", "Rata, tshwaela, abelana le modumo di mo lefelong."],
        ["Latela", "Latela modiri mo leineng le le mo karolwaneng."],
        ["O siame", "Bula seno fa o sa batle loeto gape, mme o tobetse Go fedile."]
      ]
    },
    nso: {
      skip: "Tlolela", back: "Morago", next: "Ye e latelago", done: "Go fedile", again: "O se bontšhe se gape",
      p: [
        ["O amogetšwe go ZAZISE", "Lebelela ganyane ka gae. O ka tlolela nako le ge e le efe."],
        ["Maleme", "Fetola tebelelo go leleme leo o le bolelago."],
        ["Nyaka", "Nyaka lenaneo, modiri, goba hlogo."],
        ["Lenaneo", "Gae, tše di tumilego, dikarolwana le tše dingwe di mo lenaneong le."],
        ["Tše di tumilego", "Bula lenaneo mo mola o."],
        ["Go sepela", "Mogaleng bara ye e go sepela. Sekirining se segolo profaele ya gago e godimo."],
        ["O lokile", "Bula se ge o sa nyake leeto gape, o tobetše Go fedile."]
      ],
      w: [
        ["Go lebelela go ZAZISE", "Lebelela ganyane sekirining se. Tlolela ge o nyaka."],
        ["Sebapadi", "Tobetša bapala gare. Sekirini se se tletšego se bareng ya sebapadi."],
        ["Ye e latelago", "Divideo tše dingwe di ka tlase ga sebapadi."],
        ["Rata, abelana, boloka", "Šomiša tše ge video e butšwe."],
        ["Modiri", "Ingwadiše fa ge o nyaka tše dingwe tša kanale ye."],
        ["Maleme", "Bara ya maleme e šoma le sekirining se."],
        ["O lokile", "Bula se ge o sa nyake leeto gape, o tobetše Go fedile."]
      ],
      c: [
        ["Dikarolwana", "Lebelela ganyane go dikarolwana. O ka tlolela nako le ge e le efe."],
        ["Karolwana", "Tobetša gatee gore o eme. Tobetša gape le gape gore o romele dipelo."],
        ["Nyaka", "Hwetša karolwana. Letlakala le dula ge o ngwala."],
        ["Ka namana", "Go ba ka namana go godimo. Ga se e sa bulwa."],
        ["Ditiro", "Rata, fahla, abelana le modumo di ka thoko."],
        ["Latela", "Latela modiri leineng leo le lego go karolwana."],
        ["O lokile", "Bula se ge o sa nyake leeto gape, o tobetše Go fedile."]
      ]
    },
    ts: {
      skip: "Tlula", back: "Endzhaku", next: "Lexi landzelaka", done: "Ku herile", again: "U nga ha kombisi leswi nakambe",
      p: [
        ["U amukeriwe eka ZAZISE", "Languta ka lehiswintswa ekaya. U nga tlula nkarhi wun'wana ni wun'wana."],
        ["Tindzimi", "Cinca ku languta hi ririmi leri u ri vulavulaka."],
        ["Lava", "Lava nongonoko, mudyondzisi, kumbe nhlokomhaka."],
        ["Menyu", "Kaya, leswi dumaka, swiphemu na leswin'wana swi le ka menyu leyi."],
        ["Leswi dumaka", "Pfula nongonoko eka ntila lowu."],
        ["Ku famba", "Eka riqingho bara leyi yi ku fambisa. Eka xikirini lexikulu profayili ya wena yi le henhla."],
        ["U lunghekile", "Pfula leswi loko u nga lavi ndzendzevo nakambe, u tlhela u thlava Ku herile."]
      ],
      w: [
        ["Ku languta eka ZAZISE", "Languta ka lehiswintswa eka xikirini lexi. Tlula loko u lava."],
        ["Mudlalo", "Tlhava dlala exikarhi. Xikirini lexitala xi le ka bara ya mudlalo."],
        ["Lexi landzelaka", "Mavhidiyo man'wana ma le hansi ka mudlalo."],
        ["Rhandza, avelana, hlayisa", "Tirhisa leswi loko vhidiyo yi pfuriwile."],
        ["Mudyondzisi", "Tsarisa laha loko u lava swin'wana eka chanele leyi."],
        ["Tindzimi", "Bara ya tindzimi yi tirha ni eka xikirini lexi."],
        ["U lunghekile", "Pfula leswi loko u nga lavi ndzendzevo nakambe, u tlhela u thlava Ku herile."]
      ],
      c: [
        ["Swiphemu", "Languta ka lehiswintswa eka swiphemu. U nga tlula nkarhi wun'wana ni wun'wana."],
        ["Xiphemu", "Tlhava kan'we ku yima. Tlhava nakambe ni nakambe ku rhumela timbilu."],
        ["Lava", "Kuma xiphemu. Pheji yi tshama loko u tsala."],
        ["Vutomi", "Vutomi byi le henhla. A byi si pfuriwa."],
        ["Swiendlo", "Rhandza, hlamula, avelana na mpfumawulo swi le tlhelo."],
        ["Landzelela", "Landzelela mudyondzisi eka vito leri nga eka xiphemu."],
        ["U lunghekile", "Pfula leswi loko u nga lavi ndzendzevo nakambe, u tlhela u thlava Ku herile."]
      ]
    },
    ss: {
      skip: "Yeca", back: "Emuva", next: "Lokulandzelako", done: "Kuphelile", again: "Ungaphindzi kubonisa loku",
      p: [
        ["Wamukelekile ku-ZAZISE", "Kubuka lokufishane ekhaya. Ungayeca noma nini."],
        ["Tilwimi", "Shintja kubuka kulwimi lolukhulumako."],
        ["Funa", "Funa luhlelo, umdali, noma sihloko."],
        ["Imenyu", "Ekhaya, lokutsatfwako, tincenye nalokunye kukule menyu."],
        ["Lokutsatfwako", "Vula luhlelo kule layini."],
        ["Kuhamba", "Efowini leli bha likuhambisa. Esikrinini lesikhulu iphrofayela yakho iphezulu."],
        ["Usulungele", "Vula loku uma ungafuni luhambo futsi, bese ucindzetela Kuphelile."]
      ],
      w: [
        ["Kubuka ku-ZAZISE", "Kubuka lokufishane kulesi sikrini. Yeca uma ufuna."],
        ["Sidlali", "Cindzetela dlala emkhatsini. Sikrini lesigcwele sisebha yesidlali."],
        ["Lokulandzelako", "Lamanye emavidiyo angaphansi kwesidlali."],
        ["Tsandza, yabelana, gcina", "Sebentisa loku uma ividiyo ivuliwe."],
        ["Umdali", "Bhalisa lapha uma ufuna lokungetiwe kulesi siteshi."],
        ["Tilwimi", "Ibha yetilwimi isebenta nalesi sikrini."],
        ["Usulungele", "Vula loku uma ungafuni luhambo futsi, bese ucindzetela Kuphelile."]
      ],
      c: [
        ["Tincenye", "Kubuka lokufishane kutincenye. Ungayeca noma nini."],
        ["Incenye", "Cindzetela kanye kute ume. Cindzetela futsi futsi kute utfumele tinhlitiyo."],
        ["Funa", "Tfola incenye. Likhasi lihlala nawutfayipha."],
        ["Kuphilako", "Lokuphilako kukhona lapha ngetulu. Akukavulwa."],
        ["Tento", "Tsandza, phawula, yabelana nemsindvo kuleceleni."],
        ["Landzela", "Landzela umdali ebitweni lelisencenyeni."],
        ["Usulungele", "Vula loku uma ungafuni luhambo futsi, bese ucindzetela Kuphelile."]
      ]
    },
    ve: {
      skip: "Litsha", back: "Murahu", next: "Zwi tevhelaho", done: "Zwo fhela", again: "Ni songo dovha na sumbedza izwi",
      p: [
        ["Ni amukelwa kha ZAZISE", "Lavhelesani ha pfufhi hayani. Ni nga litsha tshifhinga tshinwe na tshinwe."],
        ["Nyambo", "Shandukisani u lavhelesa kha luambo lune na lu amba."],
        ["Todani", "Todani ngudo, muendi, kana thoho."],
        ["Menyu", "Hayani, zwi tumaho, zwipida na zwinwe zwi kha menyu iyi."],
        ["Zwi tumaho", "Vulani ngudo kha mutaladzi uyu."],
        ["U tshimbila", "Kha luingo bara iyi i ni tshimbidza. Kha sikirini tshihulwane profaele yanu i ntha."],
        ["No lugela", "Vulani izwi arali ni sa tsha toda nyendo hafhu, ni dovhe na puwa Zwo fhela."]
      ],
      w: [
        ["U lavhelesa kha ZAZISE", "Lavhelesani ha pfufhi kha sikirini ili. Litshani musi ni tshi funa."],
        ["Mudzhumo", "Puwani bvela vhukati. Sikirini tsho daho tshi kha bara ya mudzhumo."],
        ["Zwi tevhelaho", "Mavhidio manwe a fhasi ha mudzhumo."],
        ["Funa, kovhelani, vhulungani", "Shumisani izwi musi vhidio yo vulwa."],
        ["Muendi", "Nwalisedzani fhano arali ni tshi toda zwinwe kha tshanele iyi."],
        ["Nyambo", "Bara ya nyambo i shuma na kha sikirini ili."],
        ["No lugela", "Vulani izwi arali ni sa tsha toda nyendo hafhu, ni dovhe na puwa Zwo fhela."]
      ],
      c: [
        ["Zwipida", "Lavhelesani ha pfufhi kha zwipida. Ni nga litsha tshifhinga tshinwe na tshinwe."],
        ["Tshipida", "Puwani luthihi u ima. Puwani hafhu na hafhu u rumela mbilu."],
        ["Todani", "Wanani tshipida. Siaṱari ḽi dzula musi ni tshi ṅwala."],
        ["Vhuponi", "Vhuponi vhu re afha ntha. A vhu athu u vulwa."],
        ["Nyito", "Funa, fhindula, kovhelani na mubvumo zwi kha thungo."],
        ["Tevhelani", "Tevhelani muendi kha dzina ḽine ḽa vha kha tshipida."],
        ["No lugela", "Vulani izwi arali ni sa tsha toda nyendo hafhu, ni dovhe na puwa Zwo fhela."]
      ]
    },
    nr: {
      skip: "Yeqa", back: "Emuva", next: "Okulandelayo", done: "Kuphelile", again: "Ungaphindi ukubonisa lokhu",
      p: [
        ["Wamukelekile ku-ZAZISE", "Ukubuka okufitjhane ekhaya. Ungayeqa noma nini."],
        ["Iilimi", "Tjhugulula ukubuka kulimi olukhulumako."],
        ["Funa", "Funa uhlelo, umdali, namkha isihloko."],
        ["Imenyu", "Ekhaya, okulanyelwako, iinqhephana nokunye kukule menyu."],
        ["Okulanyelwako", "Vula uhlelo kule layini."],
        ["Ukuhamba", "Efowini leli bha likuhambisa. Esikrinini esikhulu iphrofayela yakho iphezulu."],
        ["Usulungele", "Vula lokhu uma ungafuni uhambo godu, bese uthinta Kuphelile."]
      ],
      w: [
        ["Ukubuka ku-ZAZISE", "Ukubuka okufitjhane kilesi sikrini. Yeqa noma nini."],
        ["Isidlali", "Cindezela dlala phakathi. Iskrini esigcwele sisebha yesidlali."],
        ["Okulandelayo", "Amanye amavidiyo angaphasi kwesidlali."],
        ["Thanda, yabelana, gcina", "Sebenzisa lokhu nange ividiyo ivuliwe."],
        ["Umdali", "Bhalisa lapha uma ufuna okulandela kilesi siteshi."],
        ["Iilimi", "Ibha yeelimi isebenza nalesi sikrini."],
        ["Usulungele", "Vula lokhu uma ungafuni uhambo godu, bese uthinta Kuphelile."]
      ],
      c: [
        ["Iinqhephana", "Ukubuka okufitjhane kumaqhephana. Ungayeqa noma nini."],
        ["Iqhephana", "Thinta kanye ukuze ume. Thinta godu godu ukuze uthumele iinhliziyo."],
        ["Funa", "Thola iqhephana. Ikhasi lihlala njengoba uthayipha."],
        ["Kuphilako", "Okuphilako kukhona lapha phezulu. Akukavulwa."],
        ["Izenzo", "Thanda, phawula, yabelana nomsindo kusehlangothini."],
        ["Landela", "Landela umdali ebitweni eliseqhephaneni."],
        ["Usulungele", "Vula lokhu uma ungafuni uhambo godu, bese uthinta Kuphelile."]
      ]
    }
  };

  function lang() {
    var saved = "en";
    try { saved = localStorage.getItem("zazise.lang") || "en"; } catch (e) {}
    var code = saved;
    if (window.ZaziseI18n && ZaziseI18n.getLang) {
      var live = ZaziseI18n.getLang();
      // Before the language file loads, getLang() is still "en" and must not
      // wipe a language the visitor already chose.
      if (live && (live === saved || live !== "en" || saved === "en" || saved === "sasl")) code = live;
    }
    if (code === "sasl") code = "en";
    return COPY[code] ? code : "en";
  }

  function pack() { return COPY[lang()]; }

  function visible(el) {
    if (!el) return false;
    var s = window.getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden") return false;
    var r = el.getBoundingClientRect();
    return r.width > 8 && r.height > 8;
  }

  function inView(el) {
    if (!visible(el)) return false;
    var r = el.getBoundingClientRect();
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var w = Math.min(r.right, vw) - Math.max(r.left, 0);
    var h = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    return w > 8 && h > 8;
  }

  function activeClipSlide() {
    var scroller = document.getElementById("scroller");
    if (!scroller) return null;
    var slides = scroller.querySelectorAll(".clip-slide");
    if (!slides.length) return null;
    var anchor = scroller.getBoundingClientRect().top;
    var best = slides[0];
    var bestDist = Infinity;
    var n, dist;
    for (n = 0; n < slides.length; n++) {
      dist = Math.abs(slides[n].getBoundingClientRect().top - anchor);
      if (dist < bestDist) { bestDist = dist; best = slides[n]; }
    }
    return inView(best) ? best : null;
  }

  /* Side actions include empty padding on web. Ring the buttons, not the box. */
  function boxOf(el) {
    if (el && el.classList && el.classList.contains("clip-actions")) {
      var bits = el.querySelectorAll(".ra");
      var top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity;
      var n, r;
      for (n = 0; n < bits.length; n++) {
        r = bits[n].getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        if (r.top < top) top = r.top;
        if (r.left < left) left = r.left;
        if (r.right > right) right = r.right;
        if (r.bottom > bottom) bottom = r.bottom;
      }
      if (top !== Infinity) {
        return { top: top, left: left, right: right, bottom: bottom, width: right - left, height: bottom - top };
      }
    }
    return el.getBoundingClientRect();
  }

  function firstVisible(selectors) {
    var slide = activeClipSlide();
    var i, nodes, k, fallback = null, scoped;
    if (slide) {
      for (i = 0; i < selectors.length; i++) {
        scoped = slide.querySelector(selectors[i]);
        if (inView(scoped)) return scoped;
        if (!fallback && visible(scoped)) fallback = scoped;
      }
    }
    for (i = 0; i < selectors.length; i++) {
      nodes = document.querySelectorAll(selectors[i]);
      for (k = 0; k < nodes.length; k++) {
        if (inView(nodes[k])) return nodes[k];
        if (!fallback && visible(nodes[k])) fallback = nodes[k];
      }
    }
    return fallback;
  }

  var STEPS = {
    preview: [
      { copy: 0 },
      { copy: 1, sel: [".lang-bar"] },
      { copy: 2, sel: [".search-wrap"] },
      { copy: 3, sel: [".menu-btn"] },
      { copy: 4, sel: [".trend-card", "#trending"] },
      { copy: 5, sel: ["#mobile-dock", "#preview-profile-avatar"] },
      { copy: 6, end: true }
    ],
    watch: [
      { copy: 0 },
      { copy: 1, sel: ["#player"] },
      { copy: 2, sel: ["#row", ".uplabel"] },
      { copy: 3, sel: [".actions"] },
      { copy: 4, sel: [".channel"] },
      { copy: 5, sel: [".lang-bar"] },
      { copy: 6, end: true }
    ],
    clips: [
      { copy: 0 },
      { copy: 1, sel: [".clip-frame"] },
      { copy: 2, sel: [".clip-find", "#clip-q"] },
      { copy: 3, sel: ["#clip-live"] },
      { copy: 4, sel: [".clip-actions"] },
      { copy: 5, sel: [".clip-overlay .follow", ".follow"] },
      { copy: 6, end: true }
    ]
  };

  var steps = [];
  function collectSteps() {
    steps = STEPS[page].filter(function (step) {
      if (!step.sel) return true;
      return !!firstVisible(step.sel);
    });
  }
  collectSteps();
  if (page === "preview" && !steps.length) return;

  var css = ""
    + ".z-tour{position:fixed;inset:0;z-index:6000;font-family:inherit}"
    + ".z-tour__shade{position:fixed;inset:0;background:rgba(18,22,31,.62);z-index:1}"
    + ".z-tour__ring{position:fixed;z-index:1;border-radius:14px;box-shadow:0 0 0 9999px rgba(18,22,31,.62);pointer-events:none;transition:top .2s,left .2s,width .2s,height .2s}"
    + ".z-tour__card{position:fixed;z-index:2;width:min(360px,calc(100% - 24px));background:#fff;color:#12161f;border-radius:16px;padding:16px 16px 14px;box-shadow:0 18px 50px rgba(18,22,31,.28);box-sizing:border-box}"
    + ".z-tour__count{margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.04em;color:#6b7280}"
    + ".z-tour__card h2{margin:0 0 6px;font-size:18px;line-height:1.25}"
    + ".z-tour__card p{margin:0;font-size:14.5px;line-height:1.45;color:#3a4150}"
    + ".z-tour__again{display:none;align-items:center;gap:10px;margin-top:14px;font-size:14px;font-weight:700;cursor:pointer}"
    + ".z-tour__again.is-on{display:flex}"
    + ".z-tour__again input{position:absolute;opacity:0;width:1px;height:1px}"
    + ".z-tour__track{width:40px;height:24px;border-radius:999px;background:#d5d8e0;position:relative;flex:none}"
    + ".z-tour__track:after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .15s}"
    + ".z-tour__again input:checked + .z-tour__track{background:#183D83}"
    + ".z-tour__again input:checked + .z-tour__track:after{transform:translateX(16px)}"
    + ".z-tour__again input:focus-visible + .z-tour__track{outline:2px solid #183D83;outline-offset:2px}"
    + ".z-tour__actions{display:flex;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap}"
    + ".z-tour__skip,.z-tour__back,.z-tour__next{font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent}"
    + ".z-tour__skip{margin-right:auto;background:none;border:0;outline:none;box-shadow:none;color:#12161f;font-weight:700;padding:8px 0}"
    + ".z-tour__back{background:#fff;border:1px solid #d5d8e0;border-radius:999px;padding:8px 14px;font-weight:700}"
    + ".z-tour__next{background:#183D83;color:#fff;border:0;border-radius:999px;padding:8px 16px;font-weight:700}"
    + "@media(max-width:820px){.z-tour__ring{transition:none}.z-tour__card{left:12px!important;right:12px;width:auto;max-height:min(42dvh,280px);overflow:auto;-webkit-overflow-scrolling:touch;bottom:calc(16px + env(safe-area-inset-bottom))!important;top:auto!important}.z-tour--dock .z-tour__card{bottom:calc(76px + env(safe-area-inset-bottom))!important}.z-tour--top .z-tour__card{top:calc(12px + env(safe-area-inset-top))!important;bottom:auto!important}.z-tour__next,.z-tour__back{min-height:44px}html.z-tour-lock,html.z-tour-lock body{overflow:hidden!important;overscroll-behavior:none}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement("div");
  root.className = "z-tour";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.innerHTML = ""
    + '<div class="z-tour__shade" hidden></div>'
    + '<div class="z-tour__ring" hidden></div>'
    + '<div class="z-tour__card">'
    + '<p class="z-tour__count"></p>'
    + '<h2></h2><p class="z-tour__body"></p>'
    + '<label class="z-tour__again"><input type="checkbox"><span class="z-tour__track"></span><span class="z-tour__again-label"></span></label>'
    + '<div class="z-tour__actions">'
    + '<button type="button" class="z-tour__skip"></button>'
    + '<button type="button" class="z-tour__back"></button>'
    + '<button type="button" class="z-tour__next"></button>'
    + '</div></div>';
  document.body.appendChild(root);

  var shade = root.querySelector(".z-tour__shade");
  var ring = root.querySelector(".z-tour__ring");
  var card = root.querySelector(".z-tour__card");
  var countEl = root.querySelector(".z-tour__count");
  var titleEl = card.querySelector("h2");
  var bodyEl = root.querySelector(".z-tour__body");
  var again = root.querySelector(".z-tour__again");
  var againInput = again.querySelector("input");
  var skipBtn = root.querySelector(".z-tour__skip");
  var backBtn = root.querySelector(".z-tour__back");
  var nextBtn = root.querySelector(".z-tour__next");
  var index = 0;

  function close(remember) {
    if (remember && againInput.checked) {
      try { localStorage.setItem(KEY, "1"); } catch (e) {}
    }
    document.documentElement.classList.remove("z-tour-lock");
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", place);
    if (window.visualViewport) {
      visualViewport.removeEventListener("resize", onViewport);
      visualViewport.removeEventListener("scroll", onViewport);
    }
    root.remove();
  }

  function viewH() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
  }

  function bottomChrome() {
    if (bottomChrome.v) return bottomChrome.v;
    var el = document.createElement("div");
    el.style.cssText = "position:fixed;left:0;bottom:0;width:0;height:calc(16px + env(safe-area-inset-bottom));visibility:hidden;pointer-events:none";
    document.body.appendChild(el);
    bottomChrome.v = Math.round(el.getBoundingClientRect().height) || 16;
    el.remove();
    return bottomChrome.v;
  }

  function reserve() {
    var h = card.offsetHeight || 220;
    var limit = Math.round(viewH() * 0.42);
    var gap = window.innerWidth <= 820 ? bottomChrome() + 8 : 24;
    return Math.min(h, limit) + gap;
  }

  function scrollParents(el) {
    var node = el.parentElement;
    var list = [];
    while (node && node !== document.body && node !== document.documentElement) {
      var st = window.getComputedStyle(node);
      if (/(auto|scroll|overlay)/.test(st.overflowX + st.overflowY)) list.push(node);
      node = node.parentElement;
    }
    return list;
  }

  function snap(el, cardOnTop) {
    // Clips already fills the screen. Scrolling the window on iPhone
    // shifts the highlight off the side buttons and Follow.
    if (page === "clips") return;
    var narrow = window.innerWidth <= 820;
    var topPad = cardOnTop ? reserve() : 76;
    var bottomPad = cardOnTop || !narrow ? 20 : reserve();
    if (narrow && el.closest && el.closest(".sidebar")) {
      document.body.classList.add("menu-open");
      var sidebar = document.getElementById("preview-sidebar") || document.querySelector(".sidebar");
      if (sidebar) sidebar.classList.remove("mini");
    }
    scrollParents(el).forEach(function (node) {
      var st = window.getComputedStyle(node);
      if (!/(auto|scroll|overlay)/.test(st.overflowX)) return;
      if (node.scrollWidth <= node.clientWidth + 4) return;
      var er = boxOf(el);
      var pr = node.getBoundingClientRect();
      node.scrollLeft += (er.left + er.width / 2) - (pr.left + pr.width / 2);
    });
    var r = boxOf(el);
    var viewBottom = viewH() - bottomPad;
    if (r.top < topPad || r.bottom > viewBottom) {
      window.scrollTo(0, Math.max(0, window.scrollY + r.top - topPad));
    }
    scrollParents(el).forEach(function (node) {
      if (node.id === "scroller") {
        var box = boxOf(el);
        var frame = node.getBoundingClientRect();
        if (box.bottom > frame.top + 8 && box.top < frame.bottom - 8) return;
      }
      var st = window.getComputedStyle(node);
      if (!/(auto|scroll|overlay)/.test(st.overflowY)) return;
      if (node.scrollHeight <= node.clientHeight + 4) return;
      var er = boxOf(el);
      var pr = node.getBoundingClientRect();
      var freeTop = Math.max(pr.top, topPad);
      var freeBottom = Math.min(pr.bottom, viewH() - bottomPad);
      if (er.top < freeTop) node.scrollTop -= freeTop - er.top + 8;
      else if (er.bottom > freeBottom) node.scrollTop += er.bottom - freeBottom + 8;
    });
  }

  function draw(el) {
    var r = boxOf(el);
    var pad = 6;
    ring.hidden = false;
    ring.style.top = (r.top - pad) + "px";
    ring.style.left = (r.left - pad) + "px";
    ring.style.width = (r.width + pad * 2) + "px";
    ring.style.height = (r.height + pad * 2) + "px";
    if (window.innerWidth <= 820) return;
    card.style.transform = "none";
    card.style.right = "auto";
    card.style.bottom = "auto";
    var cardW = Math.min(360, window.innerWidth - 24);
    var left = Math.max(12, Math.min(r.left, window.innerWidth - cardW - 12));
    var top = r.bottom + 12;
    if (top + 210 > window.innerHeight) top = Math.max(12, r.top - 220);
    card.style.left = left + "px";
    card.style.top = top + "px";
  }

  function place() {
    var step = steps[index];
    var el = step.sel ? firstVisible(step.sel) : null;
    var narrow = window.innerWidth <= 820;
    if (!el) {
      ring.hidden = true;
      shade.hidden = false;
      root.classList.remove("z-tour--top");
      var dock = document.getElementById("mobile-dock");
      root.classList.toggle("z-tour--dock", !!(narrow && dock && visible(dock)));
      if (!narrow) {
        card.style.top = "50%";
        card.style.left = "50%";
        card.style.right = "auto";
        card.style.bottom = "auto";
        card.style.transform = "translate(-50%, -50%)";
      }
      return;
    }
    shade.hidden = true;
    root.classList.remove("z-tour--top");
    snap(el, false);
    requestAnimationFrame(function () {
      var r = boxOf(el);
      var lowClip = page === "clips" && el.classList && (el.classList.contains("clip-actions") || el.classList.contains("follow"));
      var covered = narrow && (lowClip || r.bottom > viewH() - reserve() + 4);
      root.classList.toggle("z-tour--top", covered);
      if (covered) snap(el, true);
      requestAnimationFrame(function () { draw(el); });
    });
  }

  function linesFor(text) {
    if (page === "watch") return text.w || COPY.en.w;
    if (page === "clips") return text.c || COPY.en.c;
    return text.p;
  }

  function show() {
    var text = pack();
    var lines = linesFor(text);
    var step = steps[index];
    var pair = lines[step.copy] || linesFor(COPY.en)[step.copy];
    countEl.textContent = (index + 1) + " / " + steps.length;
    titleEl.textContent = pair[0];
    bodyEl.textContent = pair[1];
    again.classList.toggle("is-on", !!step.end);
    again.querySelector(".z-tour__again-label").textContent = text.again;
    skipBtn.textContent = text.skip;
    backBtn.textContent = text.back;
    backBtn.hidden = index === 0;
    nextBtn.textContent = step.end ? text.done : text.next;
    place();
    try { nextBtn.focus({ preventScroll: true }); } catch (e) { nextBtn.focus(); }
  }

  function onKey(ev) {
    if (ev.key === "Escape") close(false);
  }

  skipBtn.addEventListener("click", function () { close(false); });
  backBtn.addEventListener("click", function () { if (index > 0) { index -= 1; show(); } });
  nextBtn.addEventListener("click", function () {
    if (steps[index].end) { close(true); return; }
    index += 1;
    show();
  });
  var armed = false;
  function onViewport() {
    if (page === "clips") place();
  }
  function arm() {
    if (armed) return;
    armed = true;
    if (page === "clips") document.documentElement.classList.add("z-tour-lock");
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    if (window.visualViewport) {
      visualViewport.addEventListener("resize", onViewport);
      visualViewport.addEventListener("scroll", onViewport);
    }
    document.addEventListener("zazise:lang", show);
  }
  function begin() {
    root.hidden = false;
    index = 0;
    arm();
    show();
  }
  if (page === "preview") {
    root.hidden = true;
    window.ZaziseTour = { start: begin };
  } else {
    setTimeout(function () {
      collectSteps();
      if (!steps.length) { root.remove(); return; }
      begin();
    }, 0);
  }
})();
