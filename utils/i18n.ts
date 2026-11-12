import { useAppState, type AppLanguage } from '@/contexts/app-state';
import { ndebeleTranslations } from '@/utils/ndebele';

type TranslationValues = Record<string, string | number>;

const translations: Record<Exclude<AppLanguage, 'en'>, Record<string, string>> = {
  sn: {
    'WELCOME TO MAMABOT': 'TINOKUGAMUCHIRAI KUMAMABOT',
    'Pregnancy support, all in one place': 'Rubatsiro rwepamuviri, rwese panzvimbo imwe',
    'Get trusted information, reminders and support through your phone.':
      'Wana ruzivo rwakavimbika, zviyeuchidzo nerutsigiro pafoni yako.',
    'Ask health questions': 'Bvunza mibvunzo yezveutano',
    'Set ANC reminders': 'Isa zviyeuchidzo zveANC',
    'Know danger signs': 'Ziva zviratidzo zvengozi',
    'CARE AT EVERY STAGE': 'RUTSIGIRO PAKATI PAKWESE',
    'Stay close to your care': 'Ramba uri pedyo nerubatsiro rwako',
    'Explore helpful pregnancy guidance and keep your antenatal visits in view.':
      'Wana mazano anobatsira epamuviri uye rangarira kushanya kwako kukiriniki.',
    'Guidance for each trimester': 'Mazano echikamu chimwe nechimwe chemimba',
    'Gentle ANC visit reminders': 'Zviyeuchidzo zvinyoro zvekushanya kuANC',
    'SUPPORT WITH CARE': 'RUTSIGIRO NERUDO',
    'Know when to get help': 'Ziva nguva yekutsvaga rubatsiro',
    'Ask MamaBot common pregnancy questions and learn which danger signs need urgent medical attention.':
      'Bvunza MamaBot mibvunzo yepamuviri uye dzidza zviratidzo zvinoda rubatsiro rwechimbichimbi.',
    'Answers to common questions': 'Mhinduro kumibvunzo inowanzo bvunzwa',
    'Clear danger-sign guidance': 'Mazano akajeka ezviratidzo zvengozi',
    'MamaBot is a guide, not a replacement for a healthcare professional.':
      'MamaBot inongopa ruzivo; haikwanisi kutsiva nyanzvi yezveutano.',
    Back: 'Dzokera',
    Skip: 'Darika',
    'STEP {current} OF {total}': 'DANHO {current} PANE {total}',
    Continue: 'Enderera',
    'Get Started': 'Tanga',
    'Choose your language': 'Sarudza mutauro wako',
    'Let’s get to know you': 'Ngatikuzivei',
    'I can make your guidance more helpful with a few details. You can skip anything you don’t want to share.':
      'Ndinogona kukupa mazano anobatsira kana ndikaziva zvishoma nezvako. Unogona kudarika chausingadi kugovera.',
    'What should I call you?': 'Ndingakudanai kuti ani?',
    'Your name (optional)': 'Zita rako (hazvidiwi)',
    'Phone number (optional)': 'Nhamba yefoni (hazvidiwi)',
    'How far along are you?': 'Une mavhiki mangani epamuviri?',
    'Pregnancy week (optional)': 'Vhiki repamuviri (hazvidiwi)',
    'Expected due date (optional)': 'Zuva rinotarisirwa kusununguka (hazvidiwi)',
    'For example, 24': 'Semuenzaniso, 24',
    'Choose a date': 'Sarudza zuva',
    'You can add these details later in Settings.': 'Unogona kuwedzera mashoko aya gare gare muZvirongwa.',
    'Save and continue': 'Chengeta woenderera',
    'Your details are saved on this device.': 'Mashoko ako achengetwa pafoni iyi.',
    'Your space, your pace': 'Nzvimbo yako, nenguva yako',
    'Add details to make your MamaBot experience feel more personal.':
      'Wedzera mashoko kuti MamaBot ikubatsire nenzira yakakunakira.',
    'Your profile': 'Mashoko ako',
    'Name (optional)': 'Zita (hazvidiwi)',
    'What should we call you?': 'Tingakudanai kuti ani?',
    'Add a phone number': 'Isa nhamba yefoni',
    'Save details': 'Chengeta mashoko',
    'Enter a pregnancy week from 1 to 42, or leave it blank.':
      'Isa vhiki repamuviri kubva pa1 kusvika pa42, kana kuti siya risina chinhu.',
    'Enter a valid due date in YYYY-MM-DD format.':
      'Isa zuva rakarurama nenzira yeYYYY-MM-DD.',
    'ANC notifications': 'Zviziviso zveANC',
    'Optional alerts for saved reminders. Permission is requested on this device.':
      'Zviziviso zvingasarudzwa zvezviyeuchidzo zvawakachengeta. Mvumo inokumbirwa pafoni iyi.',
    'Device notifications are available in the Android and iOS app.':
      'Zviziviso zvefoni zvinowanikwa paAndroid ne iOS.',
    'Notifications are not allowed. You can enable them in your device settings.':
      'Zviziviso hazvina kubvumidzwa. Unogona kuzvibvumidza muzvirongwa zvefoni yako.',
    'Device notifications are on for upcoming reminders.':
      'Zviziviso zvefoni zvabatidzwa pazviyeuchidzo zviri kuuya.',
    'Device notifications are off.': 'Zviziviso zvefoni zvadzimwa.',
    'About MamaBot': 'NezveMamaBot',
    'Your profile, reminders, and chat are stored on this device and are not sent to a server. MamaBot is a general information guide, not a medical service or emergency contact.':
      'Mashoko ako, zviyeuchidzo nenhaurirano zvinochengetwa pafoni iyi uye hazvitumirwi kuseva. MamaBot inopa ruzivo rwevakawanda; haisi chipatara kana rubatsiro rwechimbichimbi.',
    'Help me prepare a question': 'Ndibatsire kugadzirira mubvunzo',
    'If you have an urgent concern, contact your local emergency service or go to the nearest health facility. Do not wait for a response in this app.':
      'Kana paine dambudziko rechimbichimbi, fonera rubatsiro rwechimbichimbi kana enda kuchipatara chiri pedyo. Usamirire mhinduro muapp ino.',
    'Healthy Mother. Healthy Baby.': 'Amai vane utano. Mwana ane utano.',
    'Your smart maternal\nhealth companion': 'Shamwari yako yakangwara yerubatsiro rwaamai',
    'Loading MamaBot': 'Kuvhura MamaBot',
    'Loading...': 'Kuvhura...',
    'Your saved information could not be opened': 'Mashoko ako akachengetwa haana kukwanisa kuvhurwa',
    'Try again': 'Edza zvakare',
    'Page not found': 'Peji haina kuwanikwa',
    'This screen doesn’t exist.': 'Peji rino haripo.',
    'Return to the start': 'Dzokera pakutanga',
    Settings: 'Zvirongwa',
    More: 'Zvimwe',
    Home: 'Kumba',
    'A little support for you and your baby, every day.':
      'Rutsigiro rudiki rwako nemwana wako, zuva rega rega.',
    'YOUR PREGNANCY': 'MAPAMVIRIRO AKO',
    'Week {week} of 40': 'Vhiki {week} pamavhiki 40',
    'Pregnancy progress': 'Kufambira mberi kwepamuviri',
    'Your ANC provider can confirm your dates.':
      'Mupi wako weANC anogona kusimbisa mazuva ako.',
    'Make your guidance personal': 'Wana mazano anoenderana newe',
    'Add your pregnancy week or due date to see guidance for your stage.':
      'Isa vhiki repamuviri kana zuva rekusununguka kuti uone mazano echikamu chako.',
    'Add pregnancy dates': 'Isa mazuva epamuviri',
    'A midwife supporting an expectant mother': 'Nyamukuta achibatsira amai vane pamuviri',
    'Your next step': 'Danho rako rinotevera',
    'Keep your antenatal care close at hand.':
      'Ramba uchitevera rubatsiro rwako rweANC.',
    Info: 'Ruzivo',
    Chat: 'Nhaurirano',
    Reminders: 'Zviyeuchidzo',
    'Pregnancy Info': 'Ruzivo rwepamuviri',
    'ANC reminders': 'Zviyeuchidzo zveANC',
    'Personalized offline guide': 'Nhungamiro yako isingashandisi internet',
    'Open ANC reminders': 'Vhura zviyeuchidzo zveANC',
    'Chat with MamaBot': 'Kurukura naMamaBot',
    'Hello, {name}': 'Mhoro, {name}',
    'You’re around week {week}. How can we help today?':
      'Une mavhiki angangoita {week}. Tingakubatsira sei nhasi?',
    'How can we help today?': 'Tingakubatsira sei nhasi?',
    'Your next ANC reminder': 'Chiyeuchidzo chako chinotevera cheANC',
    'Next ANC appointment': 'Kushanya kunotevera kuANC',
    'Plan your next visit': 'Ronga kushanya kwako kunotevera',
    'Add a reminder to keep your care on track.':
      'Isa chiyeuchidzo kuti urambe uchitevera rubatsiro rwako.',
    'What can we help with?': 'Tingakubatsira nei?',
    'Find trusted guidance for you and your baby.':
      'Wana mazano akavimbika ako nemwana wako.',
    Pregnancy: 'Pamuviri',
    'Guidance for your stage': 'Mazano echikamu chako',
    'Keep visits in view': 'Rangarira kushanya kukiriniki',
    'Danger signs': 'Zviratidzo zvengozi',
    'When to seek help': 'Nguva yekutsvaga rubatsiro',
    'Ask MamaBot': 'Bvunza MamaBot',
    'Get pregnancy guidance': 'Wana mazano epamuviri',
    'MamaBot works offline. Optional online AI sends your question to MamaBot’s service and OpenRouter. Do not include names or contact details. MamaBot is not a clinician.':
      'MamaBot inoshanda isina internet. Kana ukasarudza AI iri online, mubvunzo wako unotumirwa kuseva yeMamaBot neOpenRouter. Usaisa zita rako kana mashoko ekukuzivisa. MamaBot haisi nyanzvi yezveutano.',
    'In-app chat works offline. WhatsApp and SMS need mobile network access, and their messages are handled by those providers.':
      'Nhaurirano iri muapp ino inoshanda isina internet. WhatsApp neSMS zvinoda network yefoni, uye mashoko zvinopfuura kumakambani iwayo.',
    'Online AI is on for this chat.': 'AI iri online yakabatidzwa panhaurirano iyi.',
    'Online AI is off. Your questions stay on this device.':
      'AI iri online yakadzimwa. Mibvunzo yako inoramba iri pafoni iyi.',
    'Use online AI': 'Shandisa AI iri online',
    'Turn off': 'Dzima',
    'Online AI is unavailable; this answer used on-device guidance.':
      'AI iri online haisi kuwanikwa; mhinduro iyi yashandisa mazano ari pafoni.',
    'Safety-critical guidance was answered locally.':
      'Nekuda kwekuchengeteka, mhinduro inokosha yapihwa nefoni.',
    'Could not reach online AI; this answer used on-device guidance.':
      'Hatina kukwanisa kubatana neAI iri online; mhinduro iyi yashandisa mazano ari pafoni.',
    'Checking your question with online AI…': 'Tiri kutarisa mubvunzo wako neAI iri online…',
    'Chat on WhatsApp': 'Kurukura paWhatsApp',
    'Send by SMS': 'Tumira neSMS',
    'Could not open {channel}. Check that it is available on your device.':
      'Hatina kukwanisa kuvhura {channel}. Tarisa kana ichishanda pafoni yako.',
    'This could need urgent medical attention. Please contact your local emergency service or go to the nearest health facility now. Do not wait for a reply in this app. If you can, ask someone nearby to help you get care.':
      'Izvi zvinogona kuda rubatsiro rwechimbichimbi. Bata rubatsiro rwechimbichimbi kana enda kuchipatara chiri pedyo izvozvi. Usamirire mhinduro muapp ino. Kana uchikwanisa, kumbira munhu ari pedyo akubatsire kuwana rubatsiro.',
    'Seek urgent in-person care for heavy bleeding, severe abdominal pain, a severe headache or blurred vision, difficulty breathing, fainting or seizures, high fever, fluid leaking, or reduced baby movement. Contact your local emergency service or nearest health facility now; do not wait for a reply in this app.':
      'Tsvaga rubatsiro rwechimbichimbi kuchipatara kana uchibuda ropa rakawanda, uchirwadziwa zvikuru mudumbu, uchirwadziwa musoro kana kusaona zvakanaka, uchitadza kufema, kufenda kana kubatwa nepfari, kupisa muviri zvakanyanya, kubuda mvura, kana mwana asingachafambi sezvaajaira. Bata rubatsiro rwechimbichimbi kana chipatara chiri pedyo izvozvi; usamirire mhinduro muapp ino.',
    'Reminder note': 'Chinyorwa chechiyeuchidzo',
    'Clear chat': 'Bvisa nhaurirano',
    'Suggested for around week {week}': 'Zvinokurudzirwa pavhiki rinenge riri {week}',
    'Suggested for you': 'Zvinokurudzirwa kwauri',
    'You': 'Iwe',
    'Message MamaBot': 'Tumira mashoko kunaMamaBot',
    'Ask MamaBot…': 'Bvunza MamaBot…',
    'Send message': 'Tumira mashoko',
    'Clear this chat?': 'Bvisa nhaurirano iyi here?',
    'This removes the saved conversation from this device.':
      'Izvi zvinobvisa nhaurirano yakachengetwa pafoni iyi.',
    'Keep chat': 'Chengeta nhaurirano',
    'Your message could not be saved. It is still in the text box—please try again.':
      'Mashoko ako haana kuchengetwa. Achiri mubhokisi remashoko—edza zvakare.',
    'The conversation could not be cleared. Please try again.':
      'Nhaurirano haina kukwanisa kubviswa. Edza zvakare.',
    'Your pregnancy, one step at a time': 'Rwendo rwako rwepamuviri, danho nedanho',
    'PREGNANCY CARE': 'RUBATSIRO RWEPAMUVIRI',
    'Gentle, general information to help you prepare for conversations with your ANC provider.':
      'Ruzivo rwakajairika rwekukubatsira kugadzirira kutaura nemupi wako werubatsiro rweANC.',
    'Browse by trimester': 'Tarisa nezvikamu zvemimba',
    'Choose a stage to explore guidance for that part of pregnancy.':
      'Sarudza chikamu kuti uone mazano enguva iyoyo yepamuviri.',
    'Stage guidance': 'Mazano echikamu ichi',
    'Clinic or health facility (optional)': 'Kiriniki kana nzvimbo yehutano (zvisingadiwi)',
    'Choose the actual clinic for this visit, or search by name, district or province.':
      'Sarudza kiriniki yekushanyira, kana tsvaga nezita, dunhu kana purovhinzi.',
    'Find a clinic or health facility': 'Tsvaga kiriniki kana nzvimbo yehutano',
    'Health facility': 'Nzvimbo yehutano',
    'Health facility: {name} · {district}, {province}':
      'Nzvimbo yehutano: {name} · {district}, {province}',
    'Choose a clinic or health facility': 'Sarudza kiriniki kana nzvimbo yehutano',
    '{count} facilities in Zimbabwe': 'Nzvimbo dzehutano {count} muZimbabwe',
    'Close facility list': 'Vhara runyorwa rwenzvimbo dzehutano',
    'Search facilities by name, type, district or province':
      'Tsvaga nzvimbo nezita, rudzi, dunhu kana purovhinzi',
    'Search facility, district or province': 'Tsvaga nzvimbo, dunhu kana purovhinzi',
    'Location access was not granted. You can still search all facilities by name, district or province.':
      'Hauna kupa mvumo yekushandisa nzvimbo yako. Unogona kutsvaga nzvimbo dzese nezita, dunhu kana purovhinzi.',
    'Your location could not be determined':
      'Nzvimbo yako haina kukwanisa kuzivikanwa',
    'Your location could not be determined. Search by name, district or province instead.':
      'Nzvimbo yako haina kukwanisa kuzivikanwa. Tsvaga nezita, dunhu kana purovhinzi.',
    'Location is not included in this installed app build. Rebuild and reinstall the development app to use nearby sorting. You can still search by name, district or province.':
      'Nzvimbo yefoni haina kuiswa mushanduro yeapp ino. Vakazve woisa development app patsva kuti uronge nzvimbo dzehutano nedyo. Unogona kuramba uchitsvaga nezita, dunhu kana purovhinzi.',
    'Finding nearby facilities…': 'Kutsvaga nzvimbo dzehutano dziri pedyo…',
    'Use my location to find nearby facilities':
      'Shandisa nzvimbo yangu kutsvaga nzvimbo dzehutano dziri pedyo',
    'Your location is used only to sort this list. It is not saved or sent anywhere.':
      'Nzvimbo yako inoshandiswa kuronga runyorwa urwu chete. Haichengetwi kana kutumirwa kumwe.',
    'Source file: data/zimbabwe_facilities_master-1782225366.csv. Record years range from {startYear} to {endYear}; original source and current operating status are not verified. Confirm details before traveling.':
      'Faira rakashandiswa: data/zimbabwe_facilities_master-1782225366.csv. Makore ezvinyorwa anobva {startYear} kusvika {endYear}; kwakabva mashoko uye kushanda kwenzvimbo izvozvi hazvina kusimbiswa. Simbisa usati waenda.',
    'Remove selected facility': 'Bvisa nzvimbo yasarudzwa',
    'No matching facilities': 'Hapana nzvimbo dzehutano dzawanikwa',
    'Try a different facility name, district or province.':
      'Edza rimwe zita renzvimbo, dunhu kana purovhinzi.',
    'Facility coordinates not provided': 'Marongero enzvimbo haana kupihwa',
    'Approx. {distance} km straight-line':
      'Makiromita anosvika {distance} nemutsara wakatwasuka',
    'Select {name}, {details}': 'Sarudza {name}, {details}',
    'Facility details not listed': 'Mashoko enzvimbo haana kunyorwa',
    'Facility record updated {year}': 'Chinyorwa chenzvimbo chakagadziridzwa muna {year}',
    'Facility record year not provided': 'Gore rechinyorwa chenzvimbo harina kupihwa',
    'Clinics and health facilities': 'Makiriniki nenzvimbo dzehutano',
    'Browse the supplied Zimbabwe health facilities dataset. Records date from {startYear} to {endYear} and have not been verified for current operating status.':
      'Ongorora runyorwa rwenzvimbo dzehutano rweZimbabwe rwakapihwa. Zvinyorwa zvinobva muna {startYear} kusvika {endYear} uye kushanda kwenzvimbo izvozvi hakuna kusimbiswa.',
    'Find a nearby clinic or health facility': 'Tsvaga kiriniki kana nzvimbo yehutano iri pedyo',
    'Allow location access to sort by distance, or search by facility, district or province.':
      'Bvumira kushandisa nzvimbo yako kuronga nedaro, kana tsvaga nezita renzvimbo, dunhu kana purovhinzi.',
    'First trimester': 'Chikamu chekutanga chemimba',
    'Second trimester': 'Chikamu chechipiri chemimba',
    'Third trimester': 'Chikamu chechitatu chemimba',
    'Weeks 1–13': 'Vhiki 1–13',
    'Weeks 14–27': 'Vhiki 14–27',
    'Weeks 28–40': 'Vhiki 28–40',
    'YOUR STAGE': 'CHIKAMU CHAKO',
    'Helpful topics': 'Misoro inobatsira',
    'Antenatal care visits': 'Kushanya kweANC',
    'Food, water and rest': 'Chikafu, mvura nekuzorora',
    'Medicines and supplements': 'Mishonga nezvinowedzerwa',
    'Questions for your provider': 'Mibvunzo yemupi werubatsiro',
    'Need help with a question?': 'Unoda rubatsiro nemubvunzo here?',
    'MamaBot is an offline information guide, not a medical professional. For personal advice, speak with your ANC provider.':
      'MamaBot inopa ruzivo isingashandisi internet, haisi nyanzvi yezveutano. Kuti uwane mazano ako pachako, taura nemupi wako werubatsiro rweANC.',
    'Make room for your care': 'Tsvaga nguva yekuzvichengeta',
    'Save ANC visits and personal care reminders on this device.':
      'Chengeta kushanya kuANC nezviyeuchidzo zvekuzvichengeta pafoni iyi.',
    'Your next appointment': 'Kushanya kwako kunotevera',
    'Add a visit to keep it in view.': 'Isa zuva rekushanya kuti urirangarire.',
    'Add a reminder': 'Isa chiyeuchidzo',
    'Your reminders': 'Zviyeuchidzo zvako',
    'No reminders yet': 'Hapana zviyeuchidzo',
    'Add your next ANC visit or a note for yourself. It will be saved on this device.':
      'Isa kushanya kwako kunotevera kuANC kana chinyorwa chako. Zvichachengetwa pafoni iyi.',
    'Device notifications are optional. Turn them on in Settings and allow notifications when asked. Always follow the timing given by your clinic.':
      'Zviziviso zvefoni hazvidiwi. Zvivhure muZvirongwa uye bvumidza zviziviso kana wakumbirwa. Gara uchitevera nguva yawakapihwa kukiriniki.',
    'No device alert scheduled': 'Hapana chiziviso chefoni chakarongwa',
    'Don’t wait if something feels wrong.': 'Usamirire kana paine chisina kumira zvakanaka.',
    'These warning signs need urgent medical attention. Please contact a health professional or go to a health facility right away.':
      'Zviratidzo izvi zvinoda rubatsiro rwechimbichimbi. Bata nyanzvi yezveutano kana enda kuchipatara izvozvi.',
    'Seek urgent care for': 'Tsvaga rubatsiro rwechimbichimbi kana uine',
    'Heavy bleeding': 'Kubuda ropa kwakawanda',
    'Severe or persistent headache, or changes in vision':
      'Musoro unorwadza zvikuru kana kwenguva refu, kana kuona kuchichinja',
    'Difficulty breathing, fainting, or a seizure':
      'Kutadza kufema, kufenda, kana kubatwa nepfari',
    'Severe abdominal pain or a high fever': 'Kurwadziwa kukuru mudumbu kana kupisa muviri zvakanyanya',
    'Fluid leaking, or a noticeable change in your baby’s movement':
      'Mvura inobuda, kana kuchinja kunooneka kwemafambiro emwana',
    'If you’re unsure': 'Kana usina chokwadi',
    'This list is not complete. If you feel something is seriously wrong, contact your care team or seek urgent help. This app cannot assess emergencies.':
      'Rondedzero iyi haina kukwana. Kana uchifunga kuti pane chisina kumira zvakanaka, bata timu yako yezveutano kana tsvaga rubatsiro rwechimbichimbi. App ino haigoni kuongorora njodzi.',
    'Show urgent care guidance': 'Ratidza mazano erubatsiro rwechimbichimbi',
    'Please contact your local emergency service or nearest health facility now.':
      'Bata rubatsiro rwechimbichimbi rwekwaunogara kana chipatara chiri pedyo izvozvi.',
    'Add a gentle reminder': 'Isa chiyeuchidzo chinyoro',
    'Add a clinic visit or a note for yourself. Your clinic’s advice comes first.':
      'Isa kushanya kukiriniki kana chinyorwa chako. Mazano ekiriniki yako ndiwo anotanga.',
    'Reminder title': 'Musoro wechiyeuchidzo',
    'For example, ANC appointment': 'Semuenzaniso, kushanya kuANC',
    'Note (optional)': 'Chinyorwa (hazvidiwi)',
    'What would you like to remember?': 'Chii chaunoda kuyeuka?',
    'Date (YYYY-MM-DD)': 'Zuva (YYYY-MM-DD)',
    'Time (24-hour)': 'Nguva (maawa 24)',
    When: 'Rini',
    'MamaBot will schedule a device notification if permission is available.':
      'MamaBot icharonga chiziviso chefoni kana mvumo iripo.',
    'This reminder will be saved in the app. Turn on device notifications in Settings if you want an alert.':
      'Chiyeuchidzo ichi chichachengetwa muapp. Vhura zviziviso zvefoni muZvirongwa kana uchida kuziviswa.',
    'Saving…': 'Kuchengetedza…',
    'Save reminder': 'Chengeta chiyeuchidzo',
    'Save without notification': 'Chengeta pasina chiziviso',
    'Add a title for this reminder.': 'Isa musoro wechiyeuchidzo ichi.',
    'Enter a valid date in YYYY-MM-DD format.': 'Isa zuva rakarurama nenzira yeYYYY-MM-DD.',
    'Enter a valid time in 24-hour format, such as 09:00.':
      'Isa nguva yakarurama yemaawa 24, semuenzaniso 09:00.',
    'Choose a date and time in the future.': 'Sarudza zuva nenguva zviri mberi.',
    'Remove reminder?': 'Bvisa chiyeuchidzo here?',
    'Keep reminder': 'Chengeta chiyeuchidzo',
    Remove: 'Bvisa',
    'App language': 'Mutauro weapp',
    'Choose the language MamaBot uses throughout the app.':
      'Sarudza mutauro uchashandiswa naMamaBot muapp yose.',
    'Language preference saved.': 'Mutauro waunosarudza wachengetwa.',
    'Your language preference could not be saved. Please try again.':
      'Mutauro waunosarudza hauna kukwanisa kuchengetwa. Edza zvakare.',
    Name: 'Zita',
    'Phone number': 'Nhamba yefoni',
    'Pregnancy week': 'Vhiki repamuviri',
    'Expected due date in year-month-day format': 'Zuva rinotarisirwa kusununguka nenzira yeYYYY-MM-DD',
    'Expected due date in YYYY-MM-DD format': 'Zuva rinotarisirwa kusununguka nenzira yeYYYY-MM-DD',
    'Notification settings could not be updated':
      'Zvirongwa zvezviziviso hazvina kukwanisa kuchinjwa',
    'Notification settings could not be updated. Please try again.':
      'Zvirongwa zvezviziviso hazvina kukwanisa kuchinjwa. Edza zvakare.',
    'At least one reminder alert may still be scheduled.':
      'Chiyeuchidzo chimwe chete chingangodaro chichiri chakarongwa.',
    'Changes could not be saved, and at least one reminder alert may still be scheduled.':
      'Shanduko hadzina kuchengetwa, uye chiyeuchidzo chimwe chingangodaro chichiri chakarongwa.',
    'A reminder notification could not be scheduled.':
      'Chiziviso chechiyeuchidzo hachina kukwanisa kurongwa.',
    'Go to previous onboarding step': 'Dzokera padanho rapfuura',
    'Go to step {step}': 'Enda padanho re{step}',
    'How can I estimate my pregnancy week?': 'Ndingaziva sei vhiki rangu repamuviri?',
    'What should I know about week {week}?': 'Chii chandinofanira kuziva nezvevhiki re{week}?',
    'What should I expect during pregnancy?': 'Chii chandingatarisira panguva yepamuviri?',
    'What changes might I notice in my body?': 'Shanduko dzipi dzandingangoona mumuviri wangu?',
    'How can I prepare for {title}?': 'Ndingagadzirira sei {title}?',
    'What should I expect at an ANC visit?': 'Chii chandingatarisira pakushanya kuANC?',
    'Can I take medicines or supplements?': 'Ndingatora mishonga kana zvinowedzerwa here?',
    'How can I prepare for birth?': 'Ndingagadzirira sei kusununguka?',
    'What foods and drinks are helpful?': 'Ndezvipi zvekudya nezvinwiwa zvinobatsira?',
    'Which warning signs need urgent care?': 'Ndezvipi zviratidzo zvinoda rubatsiro rwechimbichimbi?',
    'Hi {name}, I’m MamaBot. What would you like help with today?':
      'Mhoro {name}, ndini MamaBot. Ungada kubatsirwa nei nhasi?',
    'Next reminder: {title}, {date}': 'Chiyeuchidzo chinotevera: {title}, {date}',
    'Add your first ANC reminder': 'Isa chiyeuchidzo chako chekutanga cheANC',
    'Opens {title}': 'Inovhura {title}',
    'Healthy pregnancy, brighter future': 'Pamuviri une utano, ramangwana rakajeka',
    'One step at a time, Mama.': 'Danho rimwe panguva, Amai.',
    'Mama': 'Amai',
    'Early pregnancy can bring many changes. Your ANC provider can help you understand what to expect and which care is right for you.':
      'Pamuviri pekutanga panogona kuva neshanduko dzakawanda. Mupi wako werubatsiro rweANC anogona kukutsanangurira zvaungatarisira uye rubatsiro rwakakunakira.',
    'Keep attending the visits recommended by your clinic. Ask your provider about changes in your body and any medicines or supplements.':
      'Ramba uchishanyira kiriniki sezvawakakurudzirwa. Bvunza mupi wako nezveshanduko mumuviri uye mishonga kana zvinowedzerwa.',
    'Talk with your care team about birth planning, when to seek help, and how to contact your clinic if you have concerns.':
      'Taura netimu yako yezveutano nezvekuronga kusununguka, nguva yekutsvaga rubatsiro, uye nzira yekubata kiriniki kana uine zvinokunetsa.',
    'At ANC, a health worker can check on you and your baby, answer questions, and help plan any care you may need. Ask your clinic when to return and what to bring.':
      'PaANC, mushandi wezveutano anogona kukuongorora iwe nemwana, kupindura mibvunzo, uye kuronga rubatsiro rwaungade. Bvunza kiriniki kuti udzoke riini uye uuye nei.',
    'Choose a variety of nourishing foods, drink safe water, and rest when you can. Your provider can advise you about nutrition, supplements, or food needs that are specific to you.':
      'Idya zvekudya zvakasiyana zvinovaka muviri, inwa mvura yakachengeteka, uye zorora paunokwanisa. Mupi wako anogona kukupa mazano ezvekudya kana zvinowedzerwa zvakakukodzera.',
    'Check with a qualified health worker before starting, stopping, or changing medicines or supplements. Bring a list of what you take to your next visit.':
      'Bvunza mushandi wezveutano ane hunyanzvi usati watanga, wamisa, kana kushandura mishonga kana zvinowedzerwa. Enda nerondedzero yezvaunotora pakushanya kunotevera.',
    'Write down symptoms, medicines, and questions before a visit. If you have a concern between visits, contact your clinic rather than waiting for the next appointment.':
      'Nyora zviratidzo, mishonga, nemibvunzo usati washanya. Kana uine zviri kukunetsa pakati pekushanya, bata kiriniki pane kumirira kushanya kunotevera.',
    'ANC appointment': 'Kushanya kuANC',
    'Reminder date in year-month-day format': 'Zuva rechiyeuchidzo nenzira yeYYYY-MM-DD',
    'Reminder time in 24-hour format': 'Nguva yechiyeuchidzo nemaawa 24',
    'You have a reminder from MamaBot.': 'Une chiyeuchidzo kubva kunaMamaBot.',
    'A device notification could not be scheduled':
      'Chiziviso chefoni hachina kukwanisa kurongwa',
    'A device notification could not be scheduled.':
      'Chiziviso chefoni hachina kukwanisa kurongwa.',
    'Notifications are not allowed on this device. You can save the reminder without an alert.':
      'Zviziviso hazvina kubvumidzwa pafoni iyi. Unogona kuchengeta chiyeuchidzo usina chiziviso.',
    'The reminder could not be saved': 'Chiyeuchidzo hachina kukwanisa kuchengetwa',
    'The reminder could not be saved. Please try again.':
      'Chiyeuchidzo hachina kukwanisa kuchengetwa. Edza zvakare.',
    'This reminder could not be removed': 'Chiyeuchidzo ichi hachina kukwanisa kubviswa',
    'This reminder could not be removed. Please try again.':
      'Chiyeuchidzo ichi hachina kukwanisa kubviswa. Edza zvakare.',
    '“{title}” will be removed from this device.': '“{title}” ichabviswa pafoni iyi.',
    'Remove {title}': 'Bvisa {title}',
    'first': 'chekutanga',
    'second': 'chechipiri',
    'third': 'chechitatu',
    'Your saved profile puts you at around week {week}, in the {trimester} trimester. Pregnancy dates can be adjusted by your provider, so use your ANC visits to confirm your dates and ask which care is right for this stage.':
      'Mashoko ako akachengetwa anoratidza kuti une vhiki rinenge riri {week}, muchikamu {trimester} chemimba. Mazuva epamuviri anogona kugadziriswa nemupi wako wezveutano, saka simbisa mazuva ako paANC uye bvunza rubatsiro rwakakodzera panguva iyi.',
    'I don’t have your pregnancy dates yet. Your ANC provider can help estimate how far along you are. You can also add your due date or pregnancy week in your profile for more tailored suggestions.':
      'Handisati ndine mazuva ako epamuviri. Mupi wako weANC anogona kukubatsira kuziva nguva yepamuviri. Unogonawo kuisa zuva rako rekusununguka kana vhiki repamuviri mumashoko ako kuti uwane mazano akakukodzera.',
    'Pregnancy is commonly described in three trimesters: weeks 1–13, 14–27, and 28 onward. Bodies and pregnancies differ, so use regular ANC visits to discuss changes, check-ups, nutrition, medicines, and questions for your stage.{savedWeek} Your provider can confirm your dates and give advice for your situation.':
      'Pamuviri panowanzopatsanurwa kuita zvikamu zvitatu: vhiki 1–13, 14–27, uye kubva pavhiki 28 zvichienda mberi. Miviri nepamuviri zvinosiyana, saka taura nezveshanduko, kuongororwa, kudya, mishonga nemibvunzo yako paANC nguva dzose.{savedWeek} Mupi wako anogona kusimbisa mazuva ako nekupa mazano anoenderana nemamiriro ako.',
    'Your saved profile estimates around week {week}.': 'Mashoko ako akachengetwa anoratidza vhiki rinenge riri {week}.',
    'Your next saved reminder is “{title}” on {date}. You could note any questions or symptoms and bring your medicines or supplements list. Your clinic can tell you if you need to bring anything else.':
      'Chiyeuchidzo chako chinotevera ndechekuti “{title}” musi wa{date}. Unogona kunyora mibvunzo kana zviratidzo zvako, uye kuuya nerondedzero yemishonga kana zvinowedzerwa zvaunotora. Kiriniki yako inogona kukuudza zvimwe zvaunofanira kuuya nazvo.',
    'It is okay to start collecting questions about birth early. As your pregnancy progresses, ask your ANC provider about your birth plan, where to go when labour starts, transport, support people, and what to do if a concern comes up.':
      'Zvakanaka kutanga kuunganidza mibvunzo yekusununguka pachine nguva. Pamuviri paunenge uchikura, bvunza mupi wako weANC nezveurongwa hwekusununguka, kwekuenda kana kurwadziwa kwatanga, zvekufambisa, vanhu vanokutsigira, uye zvekuita kana paine chikunetsa.',
    'Talk with your ANC provider about where to give birth, how to get there, who can support you, what to bring, and how to contact the facility. Plans may need to change, so ask what to do if labour starts unexpectedly or you have a warning sign.':
      'Taura nemupi wako weANC nezvekusunungukira, nzira yekusvika ikoko, munhu angakutsigira, zvekuuya nazvo, uye nzira yekubata chipatara. Urongwa hunogona kuchinja, saka bvunza zvekuita kana kurwadziwa kwatanga usingatarisiri kana ukaona chiratidzo chengozi.',
    'Pregnancy can bring changes such as nausea, tiredness, heartburn, or back discomfort, and experiences differ. Mention symptoms at ANC, especially if they are severe, new, worsening, or worrying. Sudden swelling with a severe headache or vision changes needs urgent assessment.':
      'Pamuviri panogona kuuya nekusvotwa, kuneta, chirungurira, kana kurwadziwa musana; vanhu vanosiyana. Udza mushandi weANC nezvezviratidzo, kunyanya kana zvakanyanya, zvitsva, zvichiwedzera, kana zvichikunetsa. Kuzvimba kamwe chete pamwe nemusoro unorwadza zvikuru kana kusaona zvakanaka zvinoda kuongororwa nechimbichimbi.',
    'At an antenatal care (ANC) visit, a health worker can talk with you about your health, check on you and your baby, answer questions, and plan care. The checks and visit schedule can vary, so ask your clinic what is planned, when to return, and what to bring. It can help to write down questions and medicines you take.':
      'Pakushanya kuANC, mushandi wezveutano anogona kutaura newe nezveutano hwako, kukuongorora iwe nemwana, kupindura mibvunzo, uye kuronga rubatsiro. Kuongororwa nenguva dzekushanya zvinogona kusiyana, saka bvunza kiriniki zvakarongwa, nguva yekudzoka, uye zvekuuya nazvo. Zvinobatsira kunyora mibvunzo nemishonga yaunotora.',
    'The checks offered at ANC depend on your stage of pregnancy, health history, and local care guidance. Ask what each check is for, what the result means, and when you will hear back. Your provider can explain which tests or scans are recommended for you.':
      'Kuongororwa kunoitwa paANC kunoenderana nechikamu chepamuviri, nhoroondo yeutano, uye mazano emunzvimbo yako. Bvunza chinangwa chekuongororwa kwega kwega, zvinorehwa nemhinduro, uye nguva yauchazoziva mhinduro. Mupi wako anogona kutsanangura bvunzo kana scan dzakakukodzera.',
    'Aim for a varied diet with nourishing foods available to you, and drink safe water. Food needs can differ, so ask your ANC provider about local nutrition support, food safety, or any dietary needs. Avoid starting restrictive diets or supplements without professional advice.':
      'Edza kudya zvakasiyana uye zvinovaka muviri zviripo kwauri, uye inwa mvura yakachengeteka. Zvinodiwa pakudya zvinosiyana, saka bvunza mupi wako weANC nezverubatsiro rwekudya uye kuchengetedzwa kwezvekudya. Usatanga kudya kunorambidza zvimwe zvekudya kana kutora zvinowedzerwa usina kubvunza nyanzvi.',
    'Check with a qualified health worker or pharmacist before starting, stopping, or changing any medicine, vitamin, or supplement during pregnancy. Do not stop a prescribed medicine without advice. Bring the package or a list of what you take to ANC.':
      'Bvunza mushandi wezveutano ane hunyanzvi kana mufemesi usati watanga, wamisa, kana kushandura mushonga, vhitamini, kana zvinowedzerwa pamuviri. Usamisa mushonga wawakarayirwa usina kubvunza. Enda nemudziyo wemushonga kana rondedzero yezvaunotora kuANC.',
    'If you feel well, gentle everyday movement and rest when needed can support general wellbeing. What is suitable depends on your health and pregnancy; ask your ANC provider before starting a new or strenuous activity, especially if you have symptoms or have been advised to limit activity.':
      'Kana uchinzwa zvakanaka, kufamba zvishoma zuva nezuva uye kuzorora paunoda zvinogona kubatsira. Zvakakukodzera zvinoenderana neutano nepamuviri pako; bvunza mupi weANC usati watanga maekisesaizi matsva kana akaoma, kunyanya kana uine zviratidzo kana wakaudzwa kuti udzikise kufamba.',
    'Avoiding alcohol, tobacco, vaping, and non-prescribed drugs is the safest choice during pregnancy. If stopping is difficult, tell your ANC provider without fear of judgement; they can help you find support. Ask a health worker before using any medicine or substance.':
      'Kusashandisa doro, fodya, vape, kana zvinodhaka zvisina kunyorerwa ndiko kwakachengeteka zvikuru pamuviri. Kana zvakaoma kurega, udza mupi wako weANC usingatyi kutongwa; anogona kukubatsira kuwana rubatsiro. Bvunza mushandi wezveutano usati washandisa mushonga kana chimwe chinhu.',
    'It is okay to ask for support with stress, worry, or low mood during pregnancy. Consider telling someone you trust and speaking with your ANC provider, who can help connect you with support. If you may harm yourself or are in immediate danger, contact local emergency services or go to a health facility now.':
      'Zvakanaka kukumbira rubatsiro kana uchinetseka, uchitya, kana kusuruvara pamuviri. Funga kuudza munhu waunovimba naye uye kutaura nemupi wako weANC, anogona kukubatanidza nerubatsiro. Kana ungazvikuvadza kana uri munjodzi izvozvi, fonera rubatsiro rwechimbichimbi kana enda kuchipatara izvozvi.',
    'Your baby grows and changes throughout pregnancy, and your ANC team can explain what to expect at your stage. Once you are feeling regular movements, contact your maternity care team promptly if movement is noticeably reduced or different from your baby’s usual pattern; do not wait until the next visit.':
      'Mwana wako anokura nekuchinja pamuviri pese, uye timu yako yeANC inogona kutsanangura zvaungatarisira panguva iyi. Kana wava kunzwa mwana achifamba nguva nenguva, bata timu yako yezveutano nekukurumidza kana mafambiro akaderera kana kuchinja kubva pane zvaajaira; usamirira kushanya kunotevera.',
    'Signs and timing of labour can differ. Ask your maternity team when and where to contact them, especially if you are before 37 weeks. Contact a health facility urgently for fluid leaking, bleeding, severe pain, or a noticeable change in your baby’s movement.':
      'Zviratidzo nenguva yekutanga kurwadziwa zvinogona kusiyana. Bvunza timu yako yezveutano nguva nenzvimbo yekuvabata, kunyanya kana usati wasvitsa mavhiki 37. Bata chipatara nechimbichimbi kana mvura ichibuda, uchibuda ropa, uchirwadziwa zvikuru, kana mafambiro emwana achichinja zvinooneka.',
    'You can ask your provider how your pregnancy is progressing, which checks are planned, what symptoms to watch for, whether your medicines are suitable, when to return, and how to get help between visits. Write down any personal concerns so you can discuss them.':
      'Unogona kubvunza mupi wako mafambiro epamuviri, kuongororwa kwakarongwa, zviratidzo zvekutarisa, kana mishonga yako yakakodzera, nguva yekudzoka, uye kuwana rubatsiro pakati pekushanya. Nyora zvinokunetsa kuti muzokurukura.',
    'I’m an offline information guide and don’t have a specific answer for that. Please ask your ANC provider for advice about your situation. If you have severe pain, heavy bleeding, trouble breathing, or another urgent concern, seek in-person care now.':
      'Ndiri nhungamiro yeruzivo isingashandisi internet uye handina mhinduro chaiyo yeizvozvo. Bvunza mupi wako weANC nezvemamiriro ako. Kana uchirwadziwa zvikuru, uchibuda ropa rakawanda, uchitadza kufema, kana uine rimwe dambudziko rechimbichimbi, tsvaga rubatsiro rwechiso nechiso izvozvi.',
    'Let’s start with a language that feels like yours.':
      'Ngatitange nemutauro waunonzwa wakasununguka nawo.',
    'Choose a language. Then MamaBot will chat with you, one small question at a time.':
      'Sarudza mutauro. MamaBot achataura newe achibvunza mubvunzo mumwe panguva.',
    'Start our chat': 'Tanga nhaurirano yedu',
    'Skip for now': 'Darika izvozvi',
    'A LITTLE ABOUT YOU · {current} OF 4': 'ZVISHOMA NEZVAKO · {current} PANE 4',
    'I’m MamaBot. Let’s make this feel like your space. I’ll ask a few quick questions so I can tailor the guidance you see.':
      'Ndini MamaBot. Ngatiite kuti nzvimbo ino ive yako. Ndichabvunza mibvunzo mishoma kuti ndikupe mazano akakukodzera.',
    'What would you like me to call you?': 'Ungada kuti ndikudanidze kuti ani?',
    'What phone number can we use to reach you?':
      'Ndeipi nhamba yefoni yatingashandisa kukubata nayo?',
    'Do you know how many weeks pregnant you are?': 'Unoziva here kuti une mavhiki mangani epamuviri?',
    'Do you know your expected due date?': 'Unoziva here zuva raunotarisirwa kusununguka?',
    'I’m around week {week}': 'Ndine mavhiki angangoita {week}',
    'I’m not sure yet': 'Handisati ndava nechokwadi',
    'I don’t know it yet': 'Handisati ndariziva',
    'Thanks, {name}. I’ll use this to make your MamaBot experience more personal.':
      'Ndatenda, {name}. Ndichashandisa izvi kuti ndikupe mazano akakukodzera.',
    'Your answers stay on this device. You can change them any time in Settings.':
      'Mhinduro dzako dzicharamba dziri pafoni iyi. Unogona kudzichinja chero nguva muZvirongwa.',
    'Your answers could not be saved. Please try again.':
      'Mhinduro dzako hadzina kukwanisa kuchengetwa. Edza zvakare.',
    'Tell me what to call you, or skip this question.':
      'Ndiudze kuti ndikudanidze kuti ani, kana kuti darika mubvunzo uyu.',
    'Enter a pregnancy week from 1 to 42.':
      'Isa vhiki repamuviri kubva pa1 kusvika pa42.',
    'Enter a valid phone number.': 'Isa nhamba yefoni yakarurama.',
    'Please answer before continuing.': 'Ndapota pindura usati waenderera.',
    'Go back': 'Dzokera',
    'Your name': 'Zita rako',
    'Expected due date': 'Zuva rinotarisirwa kusununguka',
    'Type your name…': 'Nyora zita rako…',
    'Type your phone number…': 'Nyora nhamba yako yefoni…',
    'Type your pregnancy week…': 'Nyora vhiki repamuviri…',
    'Type your due date: YYYY-MM-DD': 'Nyora zuva rako: YYYY-MM-DD',
    'Send answer': 'Tumira mhinduro',
    'Save and meet MamaBot': 'Chengeta uye sangana naMamaBot',
    English: 'Chirungu',
    Shona: 'ChiShona',
    'isiNdebele': 'ChiNdebele',
  },
  nd: {
    'WELCOME TO MAMABOT': 'SILETHA KU-MAMABOT',
    'Pregnancy support, all in one place': 'Usizo ngokukhulelwa, konke endaweni yinye',
    'Get trusted information, reminders and support through your phone.':
      'Thola ulwazi oluthembekileyo, izikhumbuzo losizo ngocingo lwakho.',
    'Ask health questions': 'Buza ngemibuzo yezempilakahle',
    'Set ANC reminders': 'Hlela izikhumbuzo ze-ANC',
    'Know danger signs': 'Yazi izibonakaliso zengozi',
    'CARE AT EVERY STAGE': 'UKUNAKEKELWA KUZO ZONKE IZIGABA',
    'Stay close to your care': 'Hlala useduze lokunakekelwa kwakho',
    'Explore helpful pregnancy guidance and keep your antenatal visits in view.':
      'Thola izeluleko ngokukhulelwa njalo ukhumbule ukuvakatshela ikilinika.',
    'Guidance for each trimester': 'Izeluleko zesigaba ngasinye sokukhulelwa',
    'Gentle ANC visit reminders': 'Izikhumbuzo ezithambileyo zokuvakatshela i-ANC',
    'SUPPORT WITH CARE': 'USIZO NGOKUNAKEKELA',
    'Know when to get help': 'Yazi isikhathi sokudinga usizo',
    'Ask MamaBot common pregnancy questions and learn which danger signs need urgent medical attention.':
      'Buza uMamaBot ngemibuzo evamileyo yokukhulelwa njalo ufunde izibonakaliso zengozi ezidinga usizo ngokuphangisa.',
    'Answers to common questions': 'Izimpendulo zemibuzo evamileyo',
    'Clear danger-sign guidance': 'Izeluleko ezicacileyo ngezibonakaliso zengozi',
    'MamaBot is a guide, not a replacement for a healthcare professional.':
      'UMamaBot unikeza ulwazi kuphela; akathathi indawo yengcitshi yezempilakahle.',
    Back: 'Emuva',
    Skip: 'Dlula',
    'STEP {current} OF {total}': 'ISIGABA {current} KU-{total}',
    Continue: 'Qhubeka',
    'Get Started': 'Qalisa',
    'Choose your language': 'Khetha ulimi lwakho',
    'Let’s get to know you': 'Kasikwazi',
    'I can make your guidance more helpful with a few details. You can skip anything you don’t want to share.':
      'Ngingakunika izeluleko ezingcono nxa ngingazi okuncinyane ngawe. Ungadlula loba yini ongafuni ukuyabelana.',
    'What should I call you?': 'Ngingakubiza ngithini?',
    'Your name (optional)': 'Ibizo lakho (akudingakali)',
    'Phone number (optional)': 'Inombolo yocingo (akudingakali)',
    'How far along are you?': 'Ulamaviki amangaki ukhulelwe?',
    'Pregnancy week (optional)': 'Iviki lokukhulelwa (akudingakali)',
    'Expected due date (optional)': 'Usuku olulindele ukuzala (akudingakali)',
    'For example, 24': 'Isibonelo, 24',
    'Choose a date': 'Khetha usuku',
    'You can add these details later in Settings.': 'Ungangezelela imininingwane le kuzilungiselelo ngesikhathi esizayo.',
    'Save and continue': 'Gcina uqhubeke',
    'Your details are saved on this device.': 'Imininingwane yakho igcinwe kule foni.',
    'Your space, your pace': 'Indawo yakho, ijubane lakho',
    'Add details to make your MamaBot experience feel more personal.':
      'Faka imininingwane ukuze uMamaBot akusize ngendlela ekufaneleyo.',
    'Your profile': 'Imininingwane yakho',
    'Name (optional)': 'Ibizo (akudingakali)',
    'What should we call you?': 'Singakubiza ngithini?',
    'Add a phone number': 'Faka inombolo yocingo',
    'Save details': 'Gcina imininingwane',
    'Enter a pregnancy week from 1 to 42, or leave it blank.':
      'Faka iviki lokukhulelwa kusukela ku-1 kusiya ku-42, loba utshiye kungelalutho.',
    'Enter a valid due date in YYYY-MM-DD format.':
      'Faka usuku oluqondileyo ngendlela ethi YYYY-MM-DD.',
    'ANC notifications': 'Izaziso ze-ANC',
    'Optional alerts for saved reminders. Permission is requested on this device.':
      'Izaziso ongazikhetha ngezikhumbuzo ezigciniweyo. Imvumo izacelwa kule foni.',
    'Device notifications are available in the Android and iOS app.':
      'Izaziso zefoni ziyatholakala ku-Android lakwi-iOS.',
    'Notifications are not allowed. You can enable them in your device settings.':
      'Izaziso azivunyelwanga. Ungazivumela kuzilungiselelo zefoni yakho.',
    'Device notifications are on for upcoming reminders.':
      'Izaziso zefoni zivuliwe ngezikhumbuzo ezizayo.',
    'Device notifications are off.': 'Izaziso zefoni zivaliwe.',
    'About MamaBot': 'Mayelana loMamaBot',
    'Your profile, reminders, and chat are stored on this device and are not sent to a server. MamaBot is a general information guide, not a medical service or emergency contact.':
      'Imininingwane yakho, izikhumbuzo lengxoxo kugcinwa kule foni njalo akuthunyelwa kuseva. UMamaBot unikeza ulwazi olujayelekileyo; kasisiyo indawo yokwelatshwa loba eyosizo oluphuthumayo.',
    'Help me prepare a question': 'Ngisize ngilungiselele umbuzo',
    'If you have an urgent concern, contact your local emergency service or go to the nearest health facility. Do not wait for a response in this app.':
      'Nxa kulenkinga ephuthumayo, thinta usizo oluphuthumayo lwendawo yakho loba uye esibhedlela esiseduze. Ungalindi impendulo ku-app le.',
    'Healthy Mother. Healthy Baby.': 'Umama ophilileyo. Usane oluphileyo.',
    'Your smart maternal\nhealth companion': 'Umngane wakho ohlakaniphileyo wezempilakahle yabomama',
    'Loading MamaBot': 'Kuvulwa uMamaBot',
    'Loading...': 'Kuyavulwa...',
    'Your saved information could not be opened': 'Imininingwane yakho egciniweyo yehlulekile ukuvulwa',
    'Try again': 'Zama njalo',
    'Page not found': 'Ikhasi kalitholakalanga',
    'This screen doesn’t exist.': 'Ikhasi leli kalikho.',
    'Return to the start': 'Buyela ekuqaleni',
    Settings: 'Izilungiselelo',
    More: 'Okunye',
    Home: 'Ekhaya',
    Info: 'Ulwazi',
    Chat: 'Ingxoxo',
    Reminders: 'Izikhumbuzo',
    'Pregnancy Info': 'Ulwazi ngokukhulelwa',
    'ANC reminders': 'Izikhumbuzo ze-ANC',
    'Personalized offline guide': 'Umhlahlandlela wakho ongadingi intanethi',
    'Open ANC reminders': 'Vula izikhumbuzo ze-ANC',
    'Chat with MamaBot': 'Xoxa loMamaBot',
    'Hello, {name}': 'Salibonani, {name}',
    'You’re around week {week}. How can we help today?':
      'Ususevikweni elingaba ngu-{week}. Singakusiza ngani lamuhla?',
    'How can we help today?': 'Singakusiza ngani lamuhla?',
    'Your next ANC reminder': 'Isikhumbuzo sakho esilandelayo se-ANC',
    'Next ANC appointment': 'Ukuvakatshela i-ANC okulandelayo',
    'Plan your next visit': 'Hlela ukuvakatshela kwakho okulandelayo',
    'Add a reminder to keep your care on track.':
      'Faka isikhumbuzo ukuze ungakhohlwa ukunakekelwa kwakho.',
    'What can we help with?': 'Singakusiza ngani?',
    'Find trusted guidance for you and your baby.':
      'Thola izeluleko ezithembekileyo zakho lomntwana wakho.',
    Pregnancy: 'Ukukhulelwa',
    'Guidance for your stage': 'Izeluleko zesigaba sakho',
    'Keep visits in view': 'Khumbula ukuvakatshela ikilinika',
    'Danger signs': 'Izibonakaliso zengozi',
    'When to seek help': 'Isikhathi sokudinga usizo',
    'Ask MamaBot': 'Buza uMamaBot',
    'Get pregnancy guidance': 'Thola izeluleko ngokukhulelwa',
    'MamaBot works offline. Optional online AI sends your question to MamaBot’s service and OpenRouter. Do not include names or contact details. MamaBot is not a clinician.':
      'UMamaBot usebenza engelantanethi. Nxa ukhetha i-AI eku-inthanethi, umbuzo wakho uthunyelwa kuseva kaMamaBot le-OpenRouter. Ungafaki ibizo lakho kumbe imininingwane engakwazisa. UMamaBot kasisiyo ingcitshi yezempilakahle.',
    'In-app chat works offline. WhatsApp and SMS need mobile network access, and their messages are handled by those providers.':
      'Ingxoxo eku-app isebenza ingela-inthanethi. I-WhatsApp le-SMS kudinga inethiwekhi yefoni, lemilayezo iphathwa yizinkampani lezo.',
    'Online AI is on for this chat.': 'I-AI eku-inthanethi ivuliwe kule ingxoxo.',
    'Online AI is off. Your questions stay on this device.':
      'I-AI eku-inthanethi icinyiwe. Imibuzo yakho ihlala kule foni.',
    'Use online AI': 'Sebenzisa i-AI eku-inthanethi',
    'Turn off': 'Cima',
    'Online AI is unavailable; this answer used on-device guidance.':
      'I-AI eku-inthanethi ayitholakali; impendulo le isebenzise ulwazi olusefonini.',
    'Safety-critical guidance was answered locally.':
      'Ngenxa yokuphepha, isiqondiso esiqakathekileyo siphendulwe yifoni.',
    'Could not reach online AI; this answer used on-device guidance.':
      'Yehlulekile ukuthola i-AI eku-inthanethi; impendulo le isebenzise ulwazi olusefonini.',
    'Checking your question with online AI…': 'Sihlola umbuzo wakho nge-AI eku-inthanethi…',
    'This could need urgent medical attention. Please contact your local emergency service or go to the nearest health facility now. Do not wait for a reply in this app. If you can, ask someone nearby to help you get care.':
      'Lokhu kungadinga usizo lwezempilakahle ngokuphangisa. Thinta usizo oluphuthumayo kumbe uye esibhedlela esiseduze khathesi. Ungalindi impendulo ku-app le. Nxa usenelisa, cela umuntu oseduze lawe akuncedise uthole usizo.',
    'Seek urgent in-person care for heavy bleeding, severe abdominal pain, a severe headache or blurred vision, difficulty breathing, fainting or seizures, high fever, fluid leaking, or reduced baby movement. Contact your local emergency service or nearest health facility now; do not wait for a reply in this app.':
      'Dinga usizo ngokuphangisa nxa wopha kakhulu, usizwa ubuhlungu obukhulu besisu, ikhanda elibuhlungu kumbe ungaboni kuhle, uphefumula nzima, uwa isithuli kumbe uhlaselwa yikugula okubangela ukuqhaqhazela, ulomkhuhlane ophezulu, kuphuma amanzi, kumbe usane lungasanyakazi njengensuku zonke. Thinta usizo oluphuthumayo kumbe isibhedlela esiseduze khathesi; ungalindi impendulo ku-app le.',
    'Reminder note': 'Inothi lesikhumbuzo',
    'Clear chat': 'Susa ingxoxo',
    'Suggested for around week {week}': 'Okuphakanyiswayo ngeviki elingaba ngu-{week}',
    'Suggested for you': 'Okuphakanyiswayo kuwe',
    You: 'Wena',
    'Message MamaBot': 'Thumela umlayezo kuMamaBot',
    'Ask MamaBot…': 'Buza uMamaBot…',
    'Send message': 'Thumela umlayezo',
    'Clear this chat?': 'Susa ingxoxo le?',
    'This removes the saved conversation from this device.':
      'Lokhu kuzosusa ingxoxo egcinwe kule foni.',
    'Keep chat': 'Gcina ingxoxo',
    'Your message could not be saved. It is still in the text box—please try again.':
      'Umlayezo wakho awugcinwanga. Ulokhu usebhokisini lokubhala—zama njalo.',
    'The conversation could not be cleared. Please try again.':
      'Ingxoxo yehlulekile ukususwa. Zama njalo.',
    'Your pregnancy, one step at a time': 'Uhambo lwakho lokukhulelwa, inyathelo ngalinye',
    'PREGNANCY CARE': 'UKUNAKEKELWA KOKUKHULELWA',
    'Gentle, general information to help you prepare for conversations with your ANC provider.':
      'Ulwazi oluvamileyo olukunceda ulungiselele ukukhuluma lomhlinzeki wakho we-ANC.',
    'Browse by trimester': 'Khangela ngezigaba zokukhulelwa',
    'Choose a stage to explore guidance for that part of pregnancy.':
      'Khetha isigaba ukuze ubone izeluleko zaleso sikhathi sokukhulelwa.',
    'Stage guidance': 'Izeluleko zesigaba',
    'Clinic or health facility (optional)': 'Ikilinika kumbe indawo yezempilakahle (akudingakali)',
    'ANC appointment': 'Ukuvakatshela i-ANC',
    'Choose the actual clinic for this visit, or search by name, district or province.':
      'Khetha ikilinika ozayivakatshela, kumbe udinge ngebizo, isabelo kumbe isifundazwe.',
    'Find a clinic or health facility': 'Dinga ikilinika kumbe indawo yezempilakahle',
    'Health facility': 'Indawo yezempilakahle',
    'Health facility: {name} · {district}, {province}':
      'Indawo yezempilakahle: {name} · {district}, {province}',
    'Choose a clinic or health facility': 'Khetha ikilinika kumbe indawo yezempilakahle',
    '{count} facilities in Zimbabwe': 'Izindawo zezempilakahle ezingu-{count} eZimbabwe',
    'Close facility list': 'Vala uhlu lwezindawo zezempilakahle',
    'Search facilities by name, type, district or province':
      'Dinga izindawo ngebizo, uhlobo, isabelo kumbe isifundazwe',
    'Search facility, district or province': 'Dinga indawo, isabelo kumbe isifundazwe',
    'Location access was not granted. You can still search all facilities by name, district or province.':
      'Awuvumelanga ukusetshenziswa kwendawo okuyo. Usengadinga zonke izindawo ngebizo, isabelo kumbe isifundazwe.',
    'Your location could not be determined': 'Indawo yakho yehlulekile ukutholakala',
    'Your location could not be determined. Search by name, district or province instead.':
      'Indawo yakho yehlulekile ukutholakala. Dinga ngebizo, isabelo kumbe isifundazwe.',
    'Location is not included in this installed app build. Rebuild and reinstall the development app to use nearby sorting. You can still search by name, district or province.':
      'Ukuthola indawo yakho akukahlanganiswa kulolu hlelo olufakiweyo. Yakha njalo ufake i-development app kutsha ukuze uhlele izindawo eziseduze. Usengadinga ngebizo, isabelo kumbe isifundazwe.',
    'Finding nearby facilities…': 'Kudingwa izindawo zezempilakahle eziseduze…',
    'Use my location to find nearby facilities':
      'Sebenzisa indawo yami ukudinga ezempilakahle eziseduze',
    'Your location is used only to sort this list. It is not saved or sent anywhere.':
      'Indawo yakho isetshenziswa ukuhlela lolu hlu kuphela. Ayigcinwa njalo ayithunyelwa kwenye indawo.',
    'Source file: data/zimbabwe_facilities_master-1782225366.csv. Record years range from {startYear} to {endYear}; original source and current operating status are not verified. Confirm details before traveling.':
      'Ifayela lomthombo: data/zimbabwe_facilities_master-1782225366.csv. Iminyaka yamarekhodi isukela ku-{startYear} kusiya ku-{endYear}; umthombo lokusebenza kwamanje akuqinisekiswanga. Qinisekisa ungakayi.',
    'Remove selected facility': 'Susa indawo ekhethiweyo',
    'No matching facilities': 'Akulazindawo zezempilakahle ezitholakeleyo',
    'Try a different facility name, district or province.':
      'Zama elinye ibizo lendawo, isabelo kumbe isifundazwe.',
    'Facility coordinates not provided': 'Izixhumanisi zendawo kazinikwanga',
    'Approx. {distance} km straight-line': 'Kungaba ngamakhilomitha angu-{distance} ngomugqa oqondileyo',
    'Select {name}, {details}': 'Khetha {name}, {details}',
    'Facility details not listed': 'Imininingwane yendawo kayibhalwanga',
    'Facility record updated {year}': 'Irekhodi yendawo yalungiswa ngo-{year}',
    'Facility record year not provided': 'Umnyaka werekhodi awunikwanga',
    'Clinics and health facilities': 'Amakilinika lezindawo zezempilakahle',
    'Browse the supplied Zimbabwe health facilities dataset. Records date from {startYear} to {endYear} and have not been verified for current operating status.':
      'Bona uhlu lwezempilakahle eZimbabwe olunikezwe lolu hlelo. Amarekhodi asukela ku-{startYear} kusiya ku-{endYear} njalo ukusebenza kwamanje akuqinisekiswanga.',
    'Find a nearby clinic or health facility': 'Dinga ikilinika kumbe indawo yezempilakahle eseduze',
    'Allow location access to sort by distance, or search by facility, district or province.':
      'Vumela ukusebenzisa indawo yakho ukuze kuhlelwe ngebanga, kumbe dinga ngebizo lendawo, isabelo kumbe isifundazwe.',
    'First trimester': 'Isigaba sokuqala sokukhulelwa',
    'Second trimester': 'Isigaba sesibili sokukhulelwa',
    'Third trimester': 'Isigaba sesithathu sokukhulelwa',
    'Weeks 1–13': 'Amaviki 1–13',
    'Weeks 14–27': 'Amaviki 14–27',
    'Weeks 28–40': 'Amaviki 28–40',
    'YOUR STAGE': 'ISIGABA SAKHO',
    'Helpful topics': 'Izihloko eziluncedo',
    'Antenatal care visits': 'Ukuvakatshela ukunakekelwa kwangaphambi kokuzala',
    'Food, water and rest': 'Ukudla, amanzi lokuphumula',
    'Medicines and supplements': 'Imithi lezinto ezenezelwayo',
    'Questions for your provider': 'Imibuzo yomhlanzi wakho',
    'Need help with a question?': 'Udinga usizo ngombuzo?',
    'MamaBot is an offline information guide, not a medical professional. For personal advice, speak with your ANC provider.':
      'UMamaBot unikeza ulwazi ngaphandle kwentanethi, kasisiyo ingcitshi yezempilakahle. Ngezaluleko zakho, khuluma lomhlinzeki wakho we-ANC.',
    'Make room for your care': 'Thola isikhathi sokuzinakekela',
    'Save ANC visits and personal care reminders on this device.':
      'Gcina ukuvakatshela kwe-ANC lezikhumbuzo zokuzinakekela kule foni.',
    'Your next appointment': 'Ukuvakatshela kwakho okulandelayo',
    'Add a visit to keep it in view.': 'Faka ukuvakatshela ukuze ungakukhohlwa.',
    'Add a reminder': 'Faka isikhumbuzo',
    'Your reminders': 'Izikhumbuzo zakho',
    'No reminders yet': 'Akulazikhumbuzo',
    'Add your next ANC visit or a note for yourself. It will be saved on this device.':
      'Faka ukuvakatshela kwakho okulandelayo kwe-ANC kumbe inothi lakho. Kuzagcinwa kule foni.',
    'Device notifications are optional. Turn them on in Settings and allow notifications when asked. Always follow the timing given by your clinic.':
      'Izaziso zefoni ungazikhetha. Zivule kuzilungiselelo njalo uzivumele nxa ucelwa. Hlala ulandela isikhathi osiphiwe yikilinika.',
    'No device alert scheduled': 'Akulasaziso sefonini esihleliweyo',
    'Don’t wait if something feels wrong.': 'Ungalindi nxa uzwa kungahambi kuhle.',
    'These warning signs need urgent medical attention. Please contact a health professional or go to a health facility right away.':
      'Izibonakaliso lezi zidinga usizo lwezempilakahle ngokuphangisa. Thinta ingcitshi yezempilakahle loba uye esibhedlela khathesi.',
    'Seek urgent care for': 'Dinga usizo oluphuthumayo nxa',
    'Heavy bleeding': 'Ukopha kakhulu',
    'Severe or persistent headache, or changes in vision':
      'Ikhanda elibuhlungu kakhulu kumbe elingapheliyo, kumbe ukuguquka kokubona',
    'Difficulty breathing, fainting, or a seizure':
      'Ukuphefumula nzima, ukuwa isithuli, kumbe ukuhlaselwa yikugula okubangela ukuqhaqhazela',
    'Severe abdominal pain or a high fever': 'Ubuhlungu obukhulu besisu loba umkhuhlane ophezulu',
    'Fluid leaking, or a noticeable change in your baby’s movement':
      'Ukuphuma kwamanzi, kumbe ukuguquka okubonakalayo kokunyakaza komntwana',
    'If you’re unsure': 'Nxa ungelaqiniso',
    'This list is not complete. If you feel something is seriously wrong, contact your care team or seek urgent help. This app cannot assess emergencies.':
      'Uhlu lolu aluphelelanga. Nxa uzwa kulento engahambi kuhle, thinta ithimba lakho lezempilakahle kumbe dinga usizo oluphuthumayo. I-app le yehluleka ukuhlola izimo eziphuthumayo.',
    'Show urgent care guidance': 'Tshengisa izeluleko zosizo oluphuthumayo',
    'Please contact your local emergency service or nearest health facility now.':
      'Thinta usizo oluphuthumayo lwendawo yakho kumbe isibhedlela esiseduze khathesi.',
    'Add a gentle reminder': 'Faka isikhumbuzo esithambileyo',
    'Add a clinic visit or a note for yourself. Your clinic’s advice comes first.':
      'Faka ukuvakatshela ikilinika kumbe inothi lakho. Izeluleko zekilinika yakho ziqakathekile.',
    'Reminder title': 'Isihloko sesikhumbuzo',
    'For example, ANC appointment': 'Isibonelo, ukuvakatshela i-ANC',
    'Note (optional)': 'Inothi (akudingakali)',
    'What would you like to remember?': 'Yini ofuna ukuyikhumbula?',
    'Date (YYYY-MM-DD)': 'Usuku (YYYY-MM-DD)',
    'Time (24-hour)': 'Isikhathi (amahora angu-24)',
    When: 'Nini',
    'MamaBot will schedule a device notification if permission is available.':
      'UMamaBot uzahlela isaziso sefonini nxa imvumo ikhona.',
    'This reminder will be saved in the app. Turn on device notifications in Settings if you want an alert.':
      'Isikhumbuzo lesi sizagcinwa ku-app. Vula izaziso zefoni kuzilungiselelo nxa ufuna isaziso.',
    'Saving…': 'Kuyagcinwa…',
    'Save reminder': 'Gcina isikhumbuzo',
    'Save without notification': 'Gcina ungela saziso',
    'Add a title for this reminder.': 'Faka isihloko salesi sikhumbuzo.',
    'Enter a valid date in YYYY-MM-DD format.': 'Faka usuku oluqondileyo ngendlela ethi YYYY-MM-DD.',
    'Enter a valid time in 24-hour format, such as 09:00.':
      'Faka isikhathi esiqondileyo samahora angu-24, njengokuthi 09:00.',
    'Choose a date and time in the future.': 'Khetha usuku lesikhathi esizayo.',
    'Remove reminder?': 'Susa isikhumbuzo?',
    'Keep reminder': 'Gcina isikhumbuzo',
    Remove: 'Susa',
    'App language': 'Ulimi lwe-app',
    'Choose the language MamaBot uses throughout the app.':
      'Khetha ulimi uMamaBot azalusebenzisa ku-app yonke.',
    'Language preference saved.': 'Ulimi olukhethileyo lugciniwe.',
    'Your language preference could not be saved. Please try again.':
      'Ulimi olukhethileyo lwehlulekile ukugcinwa. Zama futhi.',
    Name: 'Ibizo',
    'Phone number': 'Inombolo yocingo',
    'Pregnancy week': 'Iviki lokukhulelwa',
    'Expected due date in year-month-day format': 'Usuku olulindele ukuzala ngendlela ethi YYYY-MM-DD',
    'Expected due date in YYYY-MM-DD format': 'Usuku olulindele ukuzala ngendlela ethi YYYY-MM-DD',
    'Notification settings could not be updated':
      'Izilungiselelo zezaziso zehlulekile ukuguqulwa',
    'Notification settings could not be updated. Please try again.':
      'Izilungiselelo zezaziso zehlulekile ukuguqulwa. Zama futhi.',
    'At least one reminder alert may still be scheduled.':
      'Isikhumbuzo esisodwa singabe silokhu sihleliwe.',
    'Changes could not be saved, and at least one reminder alert may still be scheduled.':
      'Izinguquko zehlulekile ukugcinwa, njalo isikhumbuzo esisodwa singabe silokhu sihleliwe.',
    'A reminder notification could not be scheduled.':
      'Isaziso sesikhumbuzo sehlulekile ukuhlelwa.',
    'Go to previous onboarding step': 'Buyela esigabeni esidlulileyo',
    'Go to step {step}': 'Yana esigabeni {step}',
    'How can I estimate my pregnancy week?': 'Ngingazi njani iviki lami lokukhulelwa?',
    'What should I know about week {week}?': 'Kumele ngazi ini ngeviki {week}?',
    'What should I expect during pregnancy?': 'Ngingalindela ini ngesikhathi sokukhulelwa?',
    'What changes might I notice in my body?': 'Yiluphi utshintsho engingalubona emzimbeni wami?',
    'How can I prepare for {title}?': 'Ngingalilungiselela njani {title}?',
    'What should I expect at an ANC visit?': 'Ngingalindela ini nxa ngivakatshele i-ANC?',
    'Can I take medicines or supplements?': 'Nginganatha imithi kumbe izakhamzimba ezenezelwayo?',
    'How can I prepare for birth?': 'Ngingazilungiselela njani ukubeletha?',
    'What foods and drinks are helpful?': 'Yikuphi ukudla lokunatha okungancedayo?',
    'Which warning signs need urgent care?': 'Yiziphi izibonakaliso ezidinga usizo ngokuphangisa?',
    'Hi {name}, I’m MamaBot. What would you like help with today?':
      'Salibonani {name}, nginguMamaBot. Singakusiza ngani lamuhla?',
    'first': 'sokuqala',
    'second': 'sesibili',
    'third': 'sesithathu',
    'Your saved profile puts you at around week {week}, in the {trimester} trimester. Pregnancy dates can be adjusted by your provider, so use your ANC visits to confirm your dates and ask which care is right for this stage.':
      'Imininingwane yakho itshengisa ukuthi ususevikweni elingaba ngu-{week}, kusigaba {trimester} sokukhulelwa. Umhlanzi wakho angalungisa izinsuku, ngakho qinisekisa izinsuku zakho nxa uvakatshele i-ANC ubusubuza ngokunakekelwa okufaneleyo.',
    'I don’t have your pregnancy dates yet. Your ANC provider can help estimate how far along you are. You can also add your due date or pregnancy week in your profile for more tailored suggestions.':
      'Angilalo usuku lwakho lokukhulelwa okwamanje. Umhlanzi wakho we-ANC angakunceda ubone ukuthi usukhulelwe okwesikhathi esinganani. Ungangeza usuku olulindele ukuzala kumbe iviki lokukhulelwa emininingwaneni yakho ukuze uthole izeluleko ezikufaneleyo.',
    'Pregnancy is commonly described in three trimesters: weeks 1–13, 14–27, and 28 onward. Bodies and pregnancies differ, so use regular ANC visits to discuss changes, check-ups, nutrition, medicines, and questions for your stage.{savedWeek} Your provider can confirm your dates and give advice for your situation.':
      'Ukukhulelwa kujayele ukuhlukaniswa ngezigaba ezintathu: amaviki 1–13, 14–27, kusukela evikini 28 kuye phambili. Imizimba lokukhulelwa kwehlukene, ngakho khuluma ngezinguquko, ukuhlolwa, ukudla, imithi lemibuzo yakho nxa uvakatshela i-ANC.{savedWeek} Umhlanzi wakho angaqinisekisa izinsuku akunike izeluleko ngesimo sakho.',
    'Your saved profile estimates around week {week}.': 'Imininingwane yakho itshengisa iviki elingaba ngu-{week}.',
    'Your next saved reminder is “{title}” on {date}. You could note any questions or symptoms and bring your medicines or supplements list. Your clinic can tell you if you need to bring anything else.':
      'Isikhumbuzo sakho esilandelayo sithi “{title}” ngo-{date}. Ungabhala imibuzo kumbe izibonakaliso zakho njalo uphathe uhlu lwemithi kumbe izakhamzimba ozengezayo. Ikilinika ingakutshela okunye okumele ukuphathe.',
    'It is okay to start collecting questions about birth early. As your pregnancy progresses, ask your ANC provider about your birth plan, where to go when labour starts, transport, support people, and what to do if a concern comes up.':
      'Kulungile ukuqala ukuqoqa imibuzo emayelana lokubeletha kusese lesikhathi. Njengoba ukukhulelwa kuqhubeka, buza umhlanzi wakho we-ANC ngohlelo lokubeletha, indawo yokuya nxa ususizwa yinhlungu, uhambo, abantu abazakusiza, lokumele ukwenze nxa kulokukukhathazayo.',
    'Talk with your ANC provider about where to give birth, how to get there, who can support you, what to bring, and how to contact the facility. Plans may need to change, so ask what to do if labour starts unexpectedly or you have a warning sign.':
      'Khuluma lomhlanzi wakho we-ANC ngendawo ozabeletha kuyo, ukuthi uzafika njani, ozakusiza, lokumele ukuphathe, lokuthi ungafinyelela njani esibhedlela. Uhlelo lungaguquka, ngakho buza okumele ukwenze nxa inhlungu ziqala ungalindelanga kumbe ubona isibonakaliso sengozi.',
    'Pregnancy can bring changes such as nausea, tiredness, heartburn, or back discomfort, and experiences differ. Mention symptoms at ANC, especially if they are severe, new, worsening, or worrying. Sudden swelling with a severe headache or vision changes needs urgent assessment.':
      'Ukukhulelwa kungabangela ukuhlanza, ukukhathala, ukutshisa esifubeni kumbe ubuhlungu bomhlane; okwenzakalayo kuyehluka. Tshela abe-ANC ngezibonakaliso, ikakhulu nxa zizimbi, zizintsha, ziqhubeka zisiba zimbi kumbe zikukhathaza. Ukuvuvukala okungazelelanga kulokuduma kwekhanda lokuguquka kokubona kudinga ukuhlolwa ngokuphangisa.',
    'At an antenatal care (ANC) visit, a health worker can talk with you about your health, check on you and your baby, answer questions, and plan care. The checks and visit schedule can vary, so ask your clinic what is planned, when to return, and what to bring. It can help to write down questions and medicines you take.':
      'Nxa uvakatshele i-ANC, isisebenzi sezempilakahle singakhuluma lawe ngempilakahle yakho, sikuhlole wena losane, siphendule imibuzo, sihlele ukunakekelwa. Ukuhlolwa lezikhathi zokuvakatshela kungatshiyana, ngakho buza ikilinika ngokuhleliweyo, ukuthi ubuye nini, lokumele ukuphathe. Kuyanceda ukubhala imibuzo lemithi oyinathayo.',
    'The checks offered at ANC depend on your stage of pregnancy, health history, and local care guidance. Ask what each check is for, what the result means, and when you will hear back. Your provider can explain which tests or scans are recommended for you.':
      'Ukuhlolwa okwenziwa e-ANC kuncike kusigaba sokukhulelwa, umlando wempilakahle, lezeluleko zendawo. Buza ukuthi ukuhlolwa ngakunye kwenzelwani, impumela itshoni, lokuthi uzayizwa nini. Umhlanzi wakho angachaza ukuthi yikuphi ukuhlolwa kumbe i-scan okudingayo.',
    'Aim for a varied diet with nourishing foods available to you, and drink safe water. Food needs can differ, so ask your ANC provider about local nutrition support, food safety, or any dietary needs. Avoid starting restrictive diets or supplements without professional advice.':
      'Zama ukudla okwehlukeneyo okwakha umzimba okutholakalayo njalo unathe amanzi ahlanzekileyo. Izidingo zokudla ziyatshiyana, ngakho buza umhlanzi wakho we-ANC mayelana losizo lokudla, ukuphepha kokudla, kumbe ezinye izidingo. Ungaqali ukuyekela okunye ukudla kumbe izakhamzimba ungakatholi iseluleko sengcitshi.',
    'Check with a qualified health worker or pharmacist before starting, stopping, or changing any medicine, vitamin, or supplement during pregnancy. Do not stop a prescribed medicine without advice. Bring the package or a list of what you take to ANC.':
      'Buza isisebenzi sezempilakahle esilolwazi kumbe usokhemisi ungakaqali, ungakayekeli kumbe ukuguqula imithi, amavithamini loba izakhamzimba ngesikhathi sokukhulelwa. Ungayekeli umuthi owaphiwayo ungakatholi iseluleko. Phatha ibhodlela kumbe uhlu lwalokho okunathayo nxa usiya e-ANC.',
    'If you feel well, gentle everyday movement and rest when needed can support general wellbeing. What is suitable depends on your health and pregnancy; ask your ANC provider before starting a new or strenuous activity, especially if you have symptoms or have been advised to limit activity.':
      'Nxa uzizwa ungcono, ukuhamba kancinyane lokuphumula nxa kudingeka kunganceda empilweni. Okufaneleyo kuncike empilweni yakho lokukhulelwa; buza umhlanzi wakho we-ANC ungakaqali imisebenzi emitsha kumbe enzima, ikakhulu nxa ulezibonakaliso kumbe walaywa ukuthi wehlise imisebenzi.',
    'Avoiding alcohol, tobacco, vaping, and non-prescribed drugs is the safest choice during pregnancy. If stopping is difficult, tell your ANC provider without fear of judgement; they can help you find support. Ask a health worker before using any medicine or substance.':
      'Ukungasebenzisi utshwala, igwayi, i-vape kumbe izidakamizwa ezingaphiwanga ngudokotela yikho okuphephe kakhulu ngesikhathi sokukhulelwa. Nxa kunzima ukuyekela, tshela umhlanzi wakho we-ANC ungalesabi ukwahlulelwa; angakunceda uthole usizo. Buza isisebenzi sezempilakahle ungakasebenzisi umuthi loba enye into.',
    'It is okay to ask for support with stress, worry, or low mood during pregnancy. Consider telling someone you trust and speaking with your ANC provider, who can help connect you with support. If you may harm yourself or are in immediate danger, contact local emergency services or go to a health facility now.':
      'Kulungile ukucela usizo nxa ukhathazekile, usaba kumbe uzizwa udanile ngesikhathi sokukhulelwa. Cabanga ukutshela umuntu omthembayo lokukhuluma lomhlanzi wakho we-ANC ongakuhlanganisa losizo. Nxa ungazilimaza kumbe usengozini khathesi, thinta usizo oluphuthumayo kumbe uye esibhedlela khathesi.',
    'Your baby grows and changes throughout pregnancy, and your ANC team can explain what to expect at your stage. Once you are feeling regular movements, contact your maternity care team promptly if movement is noticeably reduced or different from your baby’s usual pattern; do not wait until the next visit.':
      'Usane luyakhula luguquke ngesikhathi sokukhulelwa, njalo ithimba lakho le-ANC lingakuchasisela okulindelekileyo esigabeni sakho. Nxa ususizwa luhamba njengenjayelo, thinta ithimba lakho ngokuphangisa nxa ukuhamba kwalo kwehle kakhulu kumbe kwehlukile; ungalindi ukuvakatshela okulandelayo.',
    'Signs and timing of labour can differ. Ask your maternity team when and where to contact them, especially if you are before 37 weeks. Contact a health facility urgently for fluid leaking, bleeding, severe pain, or a noticeable change in your baby’s movement.':
      'Izibonakaliso lesikhathi sokuqala kwenhlungu kuyehluka. Buza ithimba lakho lezempilakahle ukuthi ulibiza nini futhi ngaphi, ikakhulu nxa ungelamaviki angu-37. Thinta isibhedlela ngokuphangisa nxa kuphuma amanzi, wopha, usizwa ubuhlungu obukhulu kumbe ukuhamba kosane kuguquka kakhulu.',
    'You can ask your provider how your pregnancy is progressing, which checks are planned, what symptoms to watch for, whether your medicines are suitable, when to return, and how to get help between visits. Write down any personal concerns so you can discuss them.':
      'Ungabuza umhlanzi wakho ukuthi ukukhulelwa kuqhubeka njani, yikuphi ukuhlolwa okuhleliweyo, izibonakaliso zokunanzelela, nxa imithi yakho ikufanele, isikhathi sokubuya, lokuthola usizo phakathi kokuvakatshela. Bhala izinto ezikukhathazayo ukuze lizikhulume.',
    'I’m an offline information guide and don’t have a specific answer for that. Please ask your ANC provider for advice about your situation. If you have severe pain, heavy bleeding, trouble breathing, or another urgent concern, seek in-person care now.':
      'Ngingumhlahlandlela wolwazi ongadingi intanethi njalo angilampendulo eqondileyo yalokho. Buza umhlanzi wakho we-ANC ngesimo sakho. Nxa usizwa ubuhlungu obukhulu, wopha kakhulu, uphefumula nzima kumbe ulolunye uhlupho oluphuthumayo, dinga usizo lwangempela khathesi.',
    'Next reminder: {title}, {date}': 'Isikhumbuzo esilandelayo: {title}, {date}',
    'Add your first ANC reminder': 'Faka isikhumbuzo sakho sokuqala se-ANC',
    'Opens {title}': 'Kuvula {title}',
    'Healthy pregnancy, brighter future': 'Ukukhulelwa okuphilileyo, ikusasa elihle',
    'One step at a time, Mama.': 'Inyathelo ngalinye, Mama.',
    Mama: 'Mama',
    'Reminder date in year-month-day format': 'Usuku lwesikhumbuzo ngendlela ethi YYYY-MM-DD',
    'Reminder time in 24-hour format': 'Isikhathi sesikhumbuzo ngamahora angu-24',
    'You have a reminder from MamaBot.': 'Ulesikhumbuzo esivela kuMamaBot.',
    'A device notification could not be scheduled':
      'Isaziso sefonini sehlulekile ukuhlelwa',
    'A device notification could not be scheduled.':
      'Isaziso sefonini sehlulekile ukuhlelwa.',
    'Notifications are not allowed on this device. You can save the reminder without an alert.':
      'Izaziso azivunyelwanga kule foni. Ungagcina isikhumbuzo ungasenzi isaziso.',
    'The reminder could not be saved': 'Isikhumbuzo sehlulekile ukugcinwa',
    'The reminder could not be saved. Please try again.':
      'Isikhumbuzo sehlulekile ukugcinwa. Zama njalo.',
    'This reminder could not be removed': 'Isikhumbuzo lesi sehlulekile ukususwa',
    'This reminder could not be removed. Please try again.':
      'Isikhumbuzo lesi sehlulekile ukususwa. Zama njalo.',
    '“{title}” will be removed from this device.': '“{title}” sizasuswa kule foni.',
    'Remove {title}': 'Susa {title}',
    English: 'IsiNgisi',
    Shona: 'IsiShona',
    isiNdebele: 'IsiNdebele',
  },
};

const ndebeleOverrides = ndebeleTranslations;

export function translate(
  language: AppLanguage,
  message: string,
  values: TranslationValues = {},
) {
  const translated =
    language === 'en'
      ? message
      : language === 'nd'
        ? ndebeleOverrides[message] ??
          (translations.nd[message] !== translations.sn[message]
            ? translations.nd[message] ?? message
            : message)
        : translations.sn[message] ?? message;

  return translated.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    key in values ? String(values[key]) : placeholder,
  );
}

export function useTranslation() {
  const { data } = useAppState();
  return (message: string, values?: TranslationValues) =>
    translate(data.profile.language, message, values);
}

export const languageLabels: Record<AppLanguage, string> = {
  en: 'English',
  sn: 'Shona',
  nd: 'isiNdebele',
};

export function localeForLanguage(language: AppLanguage) {
  return language === 'sn' ? 'sn-ZW' : language === 'nd' ? 'nd-ZW' : 'en-ZW';
}
