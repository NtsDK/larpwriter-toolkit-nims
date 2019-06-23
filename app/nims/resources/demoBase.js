/*Copyright 2015, 2016 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
    limitations under the License. */

'use strict';

// (function(exports){

exports.data = {
  Meta: {
    name: 'The Lord of the Rings',
    date: '3019/02/27 00:00',
    preGameDate: '3018/01/01 00:00',
    description: 'Film based LARP game basis. This base describes the first film from trilogy The Lord of the Rings. Timeline is taken from books.',
    saveTime: 'Sun Jun 23 2019 18:18:28 GMT+0200 (Центральная Европа, летнее время)'
  },
  Characters: {
    Aragorn: {
      name: 'Aragorn',
      Status: 'Reserved',
      Race: 'Human',
      Weapon: 'Bow,Knife,Sword',
      Civility: 'M',
      Outfit: '',
      'Weight, kilos.': 80,
      'Sing good': true,
      Biography: 'The last strider\'s leader and the first king of joined kingdoms, direct descent of Elendil\'s royal blood (by Isildur line).\nAragorn became the greatest human of his age. He leaded the people of west against Sauron forces. He helped to destroy the One Ring (he was one of the ring fellowship). He joined Arnor and Gondor kingdoms.',
      Side: 'Light',
      'People of Gondor': true,
      'People of Rohan': false
    },
    Arwen: {
      name: 'Arwen',
      Status: 'Reserved',
      Race: 'Elf',
      Weapon: '',
      Civility: 'F',
      Outfit: '',
      'Weight, kilos.': 55,
      'Sing good': true,
      Biography: 'Elrond\'s daughter. Galadriel\'s granddaughter.\n',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Bilbo: {
      name: 'Bilbo',
      Status: 'In discussion',
      Race: 'Hobbit',
      Weapon: 'Chestnuts,Sword',
      Civility: 'M',
      Outfit: '',
      'Weight, kilos.': 73,
      'Sing good': false,
      Biography: 'Frodo\'s uncle.',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Boromir: {
      name: 'Boromir',
      Status: 'In discussion',
      Race: 'Human',
      Weapon: 'Bow,Sword',
      Civility: 'M',
      Outfit: 'the Horn of Gondor',
      'Weight, kilos.': 90,
      'Sing good': false,
      Biography: 'The eldest son and successor of Steward of Gondor - Denethor the second and his wife Finduilas. He is a Faramir\'s brother.',
      Side: 'Neutral',
      'People of Gondor': true,
      'People of Rohan': false
    },
    Galadriel: {
      name: 'Galadriel',
      Status: 'Reserved',
      Race: 'Elf',
      Weapon: '',
      Civility: 'F',
      Outfit: 'the Nenya ring',
      'Weight, kilos.': 53,
      'Sing good': false,
      Biography: 'The mightiest elven ruler in the Middle-earth after the War of Wrath. She is the ruler of Lothlórien. ',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Gandalf: {
      name: 'Gandalf',
      Status: 'Open',
      Race: 'Maiar',
      Weapon: 'Magic,Staff',
      Civility: 'M',
      Outfit: 'the Narya ring',
      'Weight, kilos.': 82,
      'Sing good': false,
      Biography: 'Mighty wizard.',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Gimli: {
      name: 'Gimli',
      Status: 'Open',
      Race: 'Dwarf',
      Weapon: 'Axe',
      Civility: 'M',
      Outfit: '',
      'Weight, kilos.': 80,
      'Sing good': false,
      Biography: 'He is dwarf joined to war against Sauron.',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Gollum: {
      name: 'Gollum',
      Status: 'Open',
      Race: 'Other',
      Weapon: '',
      Civility: 'M',
      Outfit: '',
      'Weight, kilos.': 34,
      'Sing good': false,
      Biography: 'A small, slimy creature who lived on a small island in the centre of an underground lake at the roots of the Misty Mountains. He survived on cave fish, which he caught from his small boat, and small goblins who strayed too far from the stronghold of the Great Goblin. Over the years, his eyes adapted to the dark and became "lamp-like", shining with a sickly pale light.',
      Side: 'Dark',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Legolas: {
      name: 'Legolas',
      Status: 'Open',
      Race: 'Elf',
      Weapon: 'Bow,Elven knifes',
      Civility: 'M',
      Outfit: '',
      'Weight, kilos.': 57,
      'Sing good': true,
      Biography: 'Legolas was the son of Thranduil, King of the Woodland Realm of Northern Mirkwood.',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Merry: {
      name: 'Merry',
      Status: 'Open',
      Race: 'Hobbit',
      Weapon: 'Chestnuts',
      Civility: 'M',
      Outfit: '',
      'Weight, kilos.': 57,
      'Sing good': true,
      Biography: 'Frodo\'s friend. The fellow of the ring.',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Nazgul: {
      name: 'Nazgul',
      Status: 'Open',
      Race: 'Other',
      Weapon: '',
      Civility: 'M',
      Outfit: '',
      'Weight, kilos.': 0,
      'Sing good': true,
      Biography: 'They were nine men who succumbed to Sauron\'s power and attained near-immortality as wraiths, servants bound to the power of the One Ring and completely under the dominion of Sauron.',
      Side: 'Dark',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Pippin: {
      name: 'Pippin',
      Status: 'Open',
      Race: 'Hobbit',
      Weapon: 'Chestnuts',
      Civility: 'M',
      Outfit: '',
      'Weight, kilos.': 53,
      'Sing good': true,
      Biography: 'Frodo\'s friend. The fellow of the ring.',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Saruman: {
      name: 'Saruman',
      Status: 'Open',
      Race: 'Maiar',
      Weapon: 'Magic,Staff',
      Civility: 'M',
      Outfit: 'palantir',
      'Weight, kilos.': 68,
      'Sing good': false,
      Biography: 'He is leader of the Istari, wizards sent to Middle-earth in human form by the godlike Valar to challenge Sauron.',
      Side: 'Dark',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Sauron: {
      name: 'Sauron',
      Status: 'Open',
      Race: 'Other',
      Weapon: '',
      Civility: 'M',
      Outfit: 'palantir',
      'Weight, kilos.': 1,
      'Sing good': false,
      Biography: 'He is described as the chief lieutenant of the first Dark Lord, Morgoth.',
      Side: 'Dark',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Sam: {
      name: 'Sam',
      Status: 'Open',
      Race: 'Hobbit',
      Weapon: 'Chestnuts',
      Civility: 'M',
      Outfit: 'Hollow-ware',
      'Weight, kilos.': 57,
      'Sing good': true,
      Biography: 'Gardener, servant and friend of Frodo.',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Frodo: {
      name: 'Frodo',
      Status: 'Open',
      Race: 'Hobbit',
      Weapon: 'Chestnuts',
      Civility: 'M',
      Outfit: '',
      'Weight, kilos.': 64,
      'Sing good': true,
      Biography: 'Hobbit which became the Ring-bearer by the twist of fate.',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    },
    Elrond: {
      name: 'Elrond',
      Status: 'Open',
      Race: 'Elf',
      Weapon: '',
      Civility: 'M',
      Outfit: 'the Vilya ring',
      'Weight, kilos.': 72,
      'Sing good': false,
      Biography: 'Elrond is a son of Eärendil and Elwing. Elrond was Lord of Rivendell, one of the mighty rulers of old that remained in Middle-earth in its Third Age. ',
      Side: 'Light',
      'People of Gondor': false,
      'People of Rohan': false
    }
  },
  Stories: {
    'Arwen and Aragorn': {
      name: 'Arwen and Aragorn',
      story: 'Love story of Aragorn and Arwen. \n\n// activity\nBoth actively think about each other.\n// activity',
      characters: {
        Aragorn: {
          name: 'Aragorn',
          inventory: 'Evenstar',
          activity: {
            active: true
          }
        },
        Arwen: {
          name: 'Arwen',
          inventory: '',
          activity: {
            active: true
          }
        }
      },
      events: [
        {
          name: 'Evenstar',
          text: 'Aragorn and Arwen. Arwen gives Aragorn her jeweled pendant - Evenstar.',
          time: '3018/10/25 02:00',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Arwen: {
              text: '',
              time: ''
            }
          }
        }
      ]
    },
    'The fellowship of the Ring': {
      name: 'The fellowship of the Ring',
      story: '// activity\nFrodo actively moves forward.\nAll other heros follow him.\nBoromir actively think how to bring the Ring to Gondor.\nSaruman actively tries to stop the fellowship.\nElrond knows that the fellowship goes to Mount Doom.\nGaladriel waits fellowship in Lorien.\n// activity',
      characters: {
        Aragorn: {
          name: 'Aragorn',
          inventory: 'sheath, Elven cloak',
          activity: {
            follower: true
          }
        },
        Boromir: {
          name: 'Boromir',
          inventory: 'golden belt, Elven cloak',
          activity: {
            follower: true,
            active: true
          }
        },
        Galadriel: {
          name: 'Galadriel',
          inventory: '',
          activity: {
            passive: true
          }
        },
        Gandalf: {
          name: 'Gandalf',
          inventory: '',
          activity: {
            follower: true
          }
        },
        Gimli: {
          name: 'Gimli',
          inventory: 'Three strands of Galadriel\'s hair, Elven cloak',
          activity: {
            follower: true
          }
        },
        Legolas: {
          name: 'Legolas',
          inventory: 'Galadhrim bow, Elven cloak',
          activity: {
            follower: true
          }
        },
        Merry: {
          name: 'Merry',
          inventory: 'silver belt, Elven cloak',
          activity: {
            follower: true
          }
        },
        Pippin: {
          name: 'Pippin',
          inventory: 'silver belt, Elven cloak',
          activity: {
            follower: true
          }
        },
        Saruman: {
          name: 'Saruman',
          inventory: '',
          activity: {
            active: true
          }
        },
        Sam: {
          name: 'Sam',
          inventory: 'small grey wooden box, Elven cloak, Elven rope',
          activity: {
            follower: true
          }
        },
        Frodo: {
          name: 'Frodo',
          inventory: 'Phial of Galadriel, Elven cloak',
          activity: {
            active: true
          }
        },
        Elrond: {
          name: 'Elrond',
          inventory: '',
          activity: {
            passive: true
          }
        }
      },
      events: [
        {
          name: 'Council of Elrond',
          text: 'Council discuss the problem of destroying the Ring. Ring can be destroyed only in the Mount Doom. Nobody can do it. Frodo takes this task. Aragorn, Legolas, Gimli, Boromir, Gandalf and his Shire friends follow him. The fellowship of the Ring is created.',
          time: '3018/10/25 17:00',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Boromir: {
              text: '',
              time: ''
            },
            Gandalf: {
              text: '',
              time: ''
            },
            Gimli: {
              text: '',
              time: ''
            },
            Legolas: {
              text: '',
              time: ''
            },
            Merry: {
              text: '',
              time: ''
            },
            Pippin: {
              text: '',
              time: ''
            },
            Sam: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            },
            Elrond: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'The earth way',
          text: 'First way is closed by Sauron patrols.',
          time: '3019/01/08 13:00',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Boromir: {
              text: '',
              time: ''
            },
            Gandalf: {
              text: '',
              time: ''
            },
            Gimli: {
              text: '',
              time: ''
            },
            Legolas: {
              text: '',
              time: ''
            },
            Merry: {
              text: '',
              time: ''
            },
            Pippin: {
              text: '',
              time: ''
            },
            Saruman: {
              text: '',
              time: ''
            },
            Sam: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'The mountain way',
          text: 'Saruman\'s magic blocks the mountain way.',
          time: '3019/01/12 16:00',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Boromir: {
              text: '',
              time: ''
            },
            Gandalf: {
              text: '',
              time: ''
            },
            Gimli: {
              text: '',
              time: ''
            },
            Legolas: {
              text: '',
              time: ''
            },
            Merry: {
              text: '',
              time: ''
            },
            Pippin: {
              text: '',
              time: ''
            },
            Saruman: {
              text: '',
              time: ''
            },
            Sam: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'Moria way',
          text: 'The fellowship goes to Moria. They awaken Watcher in the Water which destroys Moria\'s gate after fellowship come in. Inside fellowship find dead bodies and understand Moria is controlled by orcs.',
          time: '3019/01/13 18:00',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Boromir: {
              text: '',
              time: ''
            },
            Gandalf: {
              text: '',
              time: ''
            },
            Gimli: {
              text: '',
              time: ''
            },
            Legolas: {
              text: '',
              time: ''
            },
            Merry: {
              text: '',
              time: ''
            },
            Pippin: {
              text: '',
              time: ''
            },
            Sam: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'Moria',
          text: 'Gandalf shows Gollum to Frodo and tells that Gollum walk with them for a long time.\nPippin accidentally drop bucket to well near Balin\'s grave. This sound awakes orcs and Balrog.',
          time: '3019/01/14 21:00',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Boromir: {
              text: '',
              time: ''
            },
            Gandalf: {
              text: '',
              time: ''
            },
            Gimli: {
              text: '',
              time: ''
            },
            Legolas: {
              text: '',
              time: ''
            },
            Merry: {
              text: '',
              time: ''
            },
            Pippin: {
              text: '',
              time: ''
            },
            Sam: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'Moria exit',
          text: 'Gandalf defends the bridge from Balrog. Balrog breaks the bridge and fall down with Gandalf. The rest of fellowship goes away from Moria and go deep in Galadriel\'s Lorien.',
          time: '3019/01/15 16:00',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Boromir: {
              text: '',
              time: ''
            },
            Gandalf: {
              text: '',
              time: ''
            },
            Gimli: {
              text: '',
              time: ''
            },
            Legolas: {
              text: '',
              time: ''
            },
            Merry: {
              text: '',
              time: ''
            },
            Pippin: {
              text: '',
              time: ''
            },
            Sam: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'Galadriel\'s mirror',
          text: 'Galadriel shows Frodo the future in the magic mirror.',
          time: '3019/02/14 21:30',
          characters: {
            Galadriel: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'Leaving Lórien',
          text: 'Lorien elves give supplies to the fellowship help to go further.',
          time: '3019/02/16 12:00',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Boromir: {
              text: '',
              time: ''
            },
            Galadriel: {
              text: '',
              time: ''
            },
            Gimli: {
              text: '',
              time: ''
            },
            Legolas: {
              text: '',
              time: ''
            },
            Merry: {
              text: '',
              time: ''
            },
            Pippin: {
              text: '',
              time: ''
            },
            Sam: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'Uruk-hai',
          text: 'Saruman sends Uruk-hai to catch the Ring-bearer.',
          time: '3019/01/10 00:00',
          characters: {
            Saruman: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'Waterfall',
          text: 'Fellowship make stop near waterfall.',
          time: '3019/02/25 16:00',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Boromir: {
              text: '',
              time: ''
            },
            Gimli: {
              text: '',
              time: ''
            },
            Legolas: {
              text: '',
              time: ''
            },
            Merry: {
              text: '',
              time: ''
            },
            Pippin: {
              text: '',
              time: ''
            },
            Sam: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            }
          }
        },
        {
          name: 'Fork',
          text: 'Boromir tries to take the Ring from Frodo. At this moment Uruk-hai found them. They kill Boromir, take Merry and Pippin and run away to Saruman. Frodo decides to go alone but Sam goes with him. The rest of fellowship bury Boromir and run for Uruk-hai detachment.',
          time: '3019/02/26 17:20',
          characters: {
            Aragorn: {
              text: '',
              time: ''
            },
            Boromir: {
              text: '',
              time: ''
            },
            Gimli: {
              text: '',
              time: ''
            },
            Legolas: {
              text: '',
              time: ''
            },
            Merry: {
              text: '',
              time: ''
            },
            Pippin: {
              text: '',
              time: ''
            },
            Sam: {
              text: '',
              time: ''
            },
            Frodo: {
              text: '',
              time: ''
            }
          }
        }
      ]
    },
    'Saruman\'s story': {
      name: 'Saruman\'s story',
      story: '// activity\nSauron and Saruman actively work on their dark plans. \n// activity\n\nSaruman creates orc army and Uruk-hai.',
      characters: {
        Saruman: {
          name: 'Saruman',
          inventory: '',
          activity: {
            active: true
          }
        },
        Sauron: {
          name: 'Sauron',
          inventory: '',
          activity: {
            active: true
          }
        }
      },
      events: [
        {
          name: 'Destroying grove',
          text: 'Saruman creates orcs and gives order to destroy grove nearby Orthanc. Also he creates Uruk-hais.',
          time: '3018/07/13 18:00',
          characters: {
            Saruman: {
              text: '',
              time: ''
            },
            Sauron: {
              text: '',
              time: ''
            }
          }
        }
      ]
    },
    'Journey begins': {
      name: 'Journey begins',
      story: '// activity\nGandalf actively search the Ring information.\nGandalf sends Frodo to Bree. Frodo runs away from nazguls (defence).\nSam, Merry and Pippin follows Frodo.\nSaruman actively catches Gandalf. Gandalf actively running away.\nAragorn passively waits hobbits in Bree. After that he defends them.\nNazguls actively search hobbits.\nSauron passively waits when Frodo puts the Ring on to find him. Arwen actively saves Frodo from nazguls.\nElrond passively waits Frodo to cure him.\n// activity\n\nDuring another one birthday Bilbo make a festive occasion and mysteriously disappered. He leaves all his things to nephew - Frodo. And the unknown Ring too.\n\nGandalf feels black magic in the Ring so he goes to Minas Tirith to find more information.\n\nSauron takes information from Gollum who is the Ring bearer and sends nazguls to catch him. \n\nGandalf goes back to Shire to warn Frodo. Ancient evil is awaken and black knights are on the way. Gandalf checks the Ring and it is that ring. Gandalf sends Frodo to Bree to the Prancing Pony tavern. Sam listens all this conversation so he was added to party.\n\nGandalf goes to Saruman to discuss the plan. But Saruman already falls into the dark side.\n\nGoing from Shire Frodo and Sam meets Merry and Pippin which stole vegetables. Suddenly nazguls go near them. All hobbits run away from nazguls.\n\nHobbit party goes to Bree and finds the Prancing Pony. They don\'t find Gandalf there. Accidentally Frodo put the Ring on. Strider sees this. Strider explains he is a friend and take hobbits to other longing.\n\nNazguls goes to the Prancing Pony into the night. They break everything hobbit room but there are no hobbits.\n\nNazguls catch hobbits in Amon Sul. One of them wounded Frodo. Strider beats off the nazguls. Arwen finds them and takes wounded Frodo to Rivendell running from nazguls.\n\nArwen brings Frodo to Rivendell. Nazguls can\'t get across the river the Rivendell boundary.\n\nFrodo is cured. Frodo meets Bilbo and gets the last inherit. The sword and the Dwarven mail.',
      characters: {
        Aragorn: {
          name: 'Aragorn',
          inventory: '',
          activity: {
            passive: true,
            follower: true
          }
        },
        Arwen: {
          name: 'Arwen',
          inventory: '',
          activity: {
            active: true
          }
        },
        Bilbo: {
          name: 'Bilbo',
          inventory: '',
          activity: {
            passive: true
          }
        },
        Gandalf: {
          name: 'Gandalf',
          inventory: '',
          activity: {
            active: true
          }
        },
        Merry: {
          name: 'Merry',
          inventory: '',
          activity: {
            follower: true
          }
        },
        Nazgul: {
          name: 'Nazgul',
          inventory: '',
          activity: {
            active: true
          }
        },
        Pippin: {
          name: 'Pippin',
          inventory: '',
          activity: {
            follower: true
          }
        },
        Saruman: {
          name: 'Saruman',
          inventory: '',
          activity: {
            active: true
          }
        },
        Sauron: {
          name: 'Sauron',
          inventory: '',
          activity: {
            passive: true
          }
        },
        Sam: {
          name: 'Sam',
          inventory: '',
          activity: {
            follower: true
          }
        },
        Frodo: {
          name: 'Frodo',
          inventory: 'the Ring, Sting, Dwarven mail',
          activity: {
            defensive: true
          }
        },
        Elrond: {
          name: 'Elrond',
          inventory: '',
          activity: {
            passive: true
          }
        }
      },
      events: [
        {
          name: 'Bilbo\'s birthday',
          text: 'During another one birthday Bilbo make a festive occasion and mysteriously disappered. He leaves all his things to nephew - Frodo. And the unknown Ring too.',
          time: '3001/09/22 21:00',
          characters: {
            Bilbo: {
              text: 'So I live a long life. So I think my age is near over. Thats why I go to elves after my birthday. But I think speech disappearing wasn\'t brilliant idea. Seems the Ring goes to my finger itself.',
              time: 'September 22, 3001',
              ready: true
            },
            Gandalf: {
              text: 'I always know Bilbo is unusual hobbit. I don\'t like his last disappearing joke in birthday but he has the heart and energy to go to elves.',
              time: 'September 22, 3001',
              ready: true
            },
            Merry: {
              text: 'Old man Bilbo made a wonderful party on his 111 birthday. Then he just disappeared from stage during his speech. Nobody understand what happens. And nobody see Bilbo in Shire anymore. Bilbo left all his things to Frodo.',
              time: 'September 22, 3001',
              ready: true
            },
            Pippin: {
              text: 'Old man Bilbo made a wonderful party on his 111 birthday. Then he just disappeared from stage during his speech. Nobody understand what happens. And nobody see Bilbo in Shire anymore. Bilbo left all his things to Frodo.',
              time: 'September 22, 3001',
              ready: true
            },
            Sam: {
              text: 'Old man Bilbo made a wonderful party on his 111 birthday. Then he just disappeared from stage during his speech. Nobody understand what happens. And nobody see Bilbo in Shire anymore. Bilbo left all his things to Frodo.',
              time: 'September 22, 3001',
              ready: true
            },
            Frodo: {
              text: 'Old man Bilbo made a wonderful party on his 111 birthday. Then he just disappeared from stage during his speech. Nobody understand what happens. And nobody see Bilbo in Shire anymore. He give all his things to me including strange ring which he never left before.',
              time: 'September 22, 3001',
              ready: true
            }
          }
        },
        {
          name: 'Gandalf\'s suspicions',
          text: 'Gandalf feels black magic in the Ring so he goes to Minas Tirith to find more information.',
          time: '3001/09/23 12:00',
          characters: {
            Bilbo: {
              text: 'So much time I tell myself - don\'t listen Gandalf. But he persuades me again. Thats why I left my precious ring to Frodo. Oh, how it lives without me?',
              time: 'September 23, 3001',
              ready: true
            },
            Gandalf: {
              text: 'I\'m worry about Bilbo\'s ring. It has powerful magic and he was so attached to the ring. It was very hard to persuade him to leave the ring to Frodo. I need to know more about this ring.',
              time: 'September 23, 3001',
              ready: true
            },
            Frodo: {
              text: 'Usually I carry the Bilbo\'s Ring but don\'t use it. Generally life goes further. Gandalf goes away somewhere.',
              time: 'September 23, 3001',
              ready: true
            }
          }
        },
        {
          name: 'Nazguls',
          text: 'Sauron takes information from Gollum who is the Ring bearer and sends nazguls to catch him. ',
          time: '3018/03/02 15:00',
          characters: {
            Nazgul: {
              text: 'Overlord sends us to Shire. We need to find the Ring-bearer and take the Ring.',
              time: 'March 2, 3018',
              ready: true
            },
            Sauron: {
              text: 'This beast tells us about the Ring bearer. This is some hobbit from Shire so I send nazguls to find him. By the way, who are hobbits?',
              time: 'March 2, 3018',
              ready: true
            }
          }
        },
        {
          name: 'Frodo\'s journey begin',
          text: 'Gandalf goes back to Shire to warn Frodo. Ancient evil is awaken and black knights are on the way. Gandalf checks the Ring and it is that ring. Gandalf sends Frodo to Bree to the Prancing Pony tavern. Sam listens all this conversation so he was added to party.',
          time: '3018/04/13 20:00',
          characters: {
            Gandalf: {
              text: 'In Minas Tirith I found that it can be the Sauron Ring. I went back to Shire. Unfortunately the ring check gives us the answer. There were fire letters on the Ring surface after throwing ring into the fire. I hear stories about black knights near the Shire. I sended Frodo to Bree. I hope I will be there in the same time. I need to have talk with Saruman. Sam heard our talk and I didn\'t want to send Frodo alone. I think Frodo needs somebody to remind him about home and resist to the Ring. Sam got a scolding for it. I\'m sure he will do task well.',
              time: 'April 4, 3018',
              ready: true
            },
            Sam: {
              text: 'It was a late night. I cut bushes near open window and suddenly heard Frodo and Gandalf talk. Gangalf\'s voice was very strained so I decided to listen carefully. I understand that Bilbo\'s Ring is real and it is very unusual and Sauron search it and it is actually not die. I listen so careful that forgot about cutting. And Gandalf pay attention that scissors are not clanking. He caught me and I tell about everything. So he sended me with Frodo to Bree.',
              time: 'April 4, 3018',
              ready: true
            },
            Frodo: {
              text: 'I went home and found agitated Gandalf. He asked me to get Bilbo\'s ring and throw it to the fire. I was surprised but the Ring was cold and there were some strange letters. Gandalf said the only one Ring has such properties - the Sauron Ring. And now Sauron is not dead. He is growing in strength and search for the Ring. He sended black knights for me and I need to run. Sam listened our talk so Gandalf sended Sam with me. We go to Bree. Gandalf will meet us there.',
              time: 'April 4, 3018',
              ready: true
            }
          }
        },
        {
          name: 'Saruman captures Gandalf',
          text: 'Gandalf goes to Saruman to discuss the plan. But Saruman already falls into the dark side.',
          time: '3018/07/10 16:00',
          characters: {
            Gandalf: {
              text: 'I came to Saruman to discuss our actions. But as it happens Saruman is on the one side with Sauron. He caught me and lock on the Orthanc roof. Miraculously the eagle saved me. I can\'t be in Bree in time.',
              time: 'July 10, 3018',
              ready: true
            },
            Saruman: {
              text: 'I see infinite darkness in palantir and I see this is my way. Gandalf\'s visit was not surprise. The overlord ordered to join Gandalf to us. But Gandalf find how to run away. So much the worse for him.',
              time: 'July 10, 3018',
              ready: true
            }
          }
        },
        {
          name: 'Merry and Pippin',
          text: 'Going from Shire Frodo and Sam meets Merry and Pippin which stole vegetables. Suddenly nazguls go near them. All hobbits run away from nazguls.',
          time: '3018/04/17 13:00',
          characters: {
            Merry: {
              text: 'I and Pippin run away from angry farmer by the field and suddenly meet Frodo and Sam. They run with us. I don\'t think farmer will examine who is not guilty. We escaped from farmer and found the road and suddenly feel cold. We hide nearby and at this moment see the black rider. Frodo tells that there are several riders which search him and they go to Bree as fast as possible. We joined their company.',
              time: 'April 17, 3018',
              ready: true
            },
            Pippin: {
              text: 'I and Merry run away from angry farmer by the field and suddenly meet Frodo and Sam. They run with us. I don\'t think farmer will examine who is not guilty. We escaped from farmer and found the road and suddenly feel cold. We hide nearby and at this moment see the black rider. Frodo tells that there are several riders which search him and they go to Bree as fast as possible. We joined their company.',
              time: 'April 17, 3018',
              ready: true
            },
            Sam: {
              text: 'Pippin and Merry as usual run away from angry farmer by the field and suddenly meet us. We run with them. I don\'t think farmer will examine who is not guilty. We escaped from farmer and found the road and suddenly feel cold. We hide nearby and at this moment see the black rider. Frodo told that there are several riders which search him and we go to Bree as fast as possible. Merry and Pippin joined to our company.',
              time: 'April 17, 3018',
              ready: true
            },
            Frodo: {
              text: 'Pippin and Merry run away from angry farmer by the field and suddenly meet us. We run with them. I don\'t think farmer will examine who is not guilty. We escaped from farmer and found the road and suddenly feel cold. We hide nearby and at this moment see the black rider. I told that there are several riders which search me and we go to Bree. Merry and Pippin joined to our company.',
              time: 'April 17, 3018',
              ready: true
            }
          }
        },
        {
          name: 'the Prancing Pony',
          text: 'Hobbit party goes to Bree and finds the Prancing Pony. They don\'t find Gandalf there. Accidentally Frodo put the Ring on. Strider sees this. Strider explains he is a friend and take hobbits to other longing.',
          time: '3018/09/30 20:00',
          characters: {
            Aragorn: {
              text: 'Hobbits company came to Bree. Hobbits are so awkward. I knew that they will come but I decided to wait a bit. Too bad I didn\'t come at once - Frodo bering the Ring in the hall centre. Now Sauron and nazguls definitely knows where to search them. One way or another I introduced myself took hobbits to other longing. It is obvious nazguls will visit the Prancing Pony this night.',
              time: 'September 30, 3018',
              ready: true
            },
            Merry: {
              text: 'We came to the Prancing Pony. There was no Gangalf. We didn\'t know what to do and decided to stay overnight. Suddenly Frodo felt sick and disappeared the same way as Bilbo in birthday. We didn\'t understand what happen. We tried to find Frodo without success. Suddenly we saw human going away with Frodo. We went for him and prepare to fight. It emerged that this is Strider, Gandalf\'s friend and he will guard us. Strider said it is dangerous to stay overnight in the Prancing Pony so he lead us to other longing.',
              time: 'September 30, 3018',
              ready: true
            },
            Pippin: {
              text: 'We came to the Prancing Pony. There was no Gangalf. We didn\'t know what to do and decided to stay overnight. Suddenly Frodo felt sick and disappeared the same way as Bilbo in birthday. We didn\'t understand what happen. We tried to find Frodo without success. Suddenly we saw human going away with Frodo. We went for him and prepare to fight. It emerged that this is Strider, Gandalf\'s friend and he will guard us. Strider said it is dangerous to stay overnight in the Prancing Pony so he lead us to other longing.',
              time: 'September 30, 3018',
              ready: true
            },
            Sam: {
              text: 'We came to the Prancing Pony. There was no Gangalf. We didn\'t know what to do and decided to stay overnight. Suddenly Frodo felt sick and disappeared the same way as Bilbo in birthday. We didn\'t understand what happen. We tried to find Frodo without success. Suddenly we saw human going away with Frodo. We went for him and prepare to fight. It emerged that this is Strider, Gandalf\'s friend and he will guard us. Strider said it is dangerous to stay overnight in the Prancing Pony so he lead us to other longing.',
              time: 'September 30, 3018',
              ready: true
            },
            Frodo: {
              text: 'We came to the Prancing Pony. There was no Gangalf. We didn\'t know what to do and decided to stay overnight. Suddenly I felt irresistible desire to bear the Ring and did it. The world loose all colours. There were only shadows instead people. And among everything the big fire eye look at me. Horror stricken I slipped the ring off finger. Nobody looked at me. Thats why I think everything is good but suddenly human grabbed me and take away to internal rooms. It was a Strider a Gandalf\'s friend. He met us. He was very angry at me that I bering the ring. Sauron has eyes and ears everywhere. My friends tried to save me from Strider but I explain them he is a friend. Strider said it is dangerous to stay overnight in the Prancing Pony so he lead us to other longing.',
              time: 'September 30, 3018',
              ready: true
            }
          }
        },
        {
          name: 'Night attack',
          text: 'Nazguls goes to the Prancing Pony into the night. They break everything hobbit room but there are no hobbits.',
          time: '3018/09/31 04:00',
          characters: {
            Aragorn: {
              text: 'We heard strange sounds and screams from the Prancing Pony. In the morning hobbits room was upside down and beds were pierced with swords. This time nazguls made a mistake. We need to go away from Bree.',
              time: 'October 1, 3018',
              ready: true
            },
            Merry: {
              text: 'We heard strange sounds and screams from the Prancing Pony. In the morning hobbits room was upside down and beds were pierced with swords. I\'m very scared but I need to go with Frodo. He is in a big danger.',
              time: 'October 1, 3018',
              ready: true
            },
            Nazgul: {
              text: 'We went to tavern in the night. There were hobbits which we searched for. But there were no one in their room. We will happily kill everybody in this city but Strider is nearby and only he can interferes. We have time. We will wait when hobbit bering the ring and show himself.',
              time: 'October 1, 3018',
              ready: true
            },
            Pippin: {
              text: 'We heard strange sounds and screams from the Prancing Pony. In the morning hobbits room was upside down and beds were pierced with swords. I\'m very scared but I need to go with Frodo. He is in a big danger.',
              time: 'October 1, 3018',
              ready: true
            },
            Sam: {
              text: 'We heard strange sounds and screams from the Prancing Pony. In the morning hobbits room was upside down and beds were pierced with swords. I\'m very scared but I need to go with Frodo. He is in a big danger.',
              time: 'October 1, 3018',
              ready: true
            },
            Frodo: {
              text: 'We heard strange sounds and screams from the Prancing Pony. In the morning hobbits room was upside down and beds were pierced with swords. I\'m very scared but we need to go. The Ring is my burden. Nobody can do this except me.',
              time: 'October 1, 3018',
              ready: true
            }
          }
        },
        {
          name: 'Amon Sûl',
          text: 'Nazguls catch hobbits in Amon Sul. One of them wounded Frodo. Strider beats off the nazguls. Arwen finds them and takes wounded Frodo to Rivendell running from nazguls.',
          time: '3018/10/04 03:30',
          characters: {
            Aragorn: {
              text: 'I went to patrol for nothing. Nazguls stole by me. I drove them away hardly but they wounded Frodo. I could save him. Arwen came unexpectedly. She took Frodo from me. I hope black riders will not overtake them on the Rivendell way.',
              time: 'October 4, 3018',
              ready: true
            },
            Arwen: {
              text: 'I felt cold and pain and run to this place. Strider just drove nazguls away from hobbits. The ring-bearer was wounded. The only hope was my horse. We rode to Rivendell as far as we can.',
              time: 'October 4, 3018',
              ready: true
            },
            Merry: {
              text: 'Strider went to patrol. Suddenly nazguls surrounded us. We tried to fight but they just throw us. They wounded me and finally Strider came back. Strider drove out nazguls. He tended to wound but suddenly we saw elven woman. So Rivendell was not far away. She took Frodo and rode to Rivendell. I hope Frodo will be fine.',
              time: 'October 4, 3018',
              ready: true
            },
            Nazgul: {
              text: 'We surrounded hobbits. We felt the Ring power. And Strider came back. He countered an attack. We wounded the Ring bearer. He hadn\'t much time. Suddenly elven woman appered...',
              time: 'October 4, 3018',
              ready: true
            },
            Pippin: {
              text: 'Strider went to patrol. Suddenly nazguls surrounded us. We tried to fight but they just throw us. They wounded me and finally Strider came back. Strider drove out nazguls. He tended to wound but suddenly we saw elven woman. So Rivendell was not far away. She took Frodo and rode to Rivendell. I hope Frodo will be fine.',
              time: 'October 4, 3018',
              ready: true
            },
            Sam: {
              text: 'Strider went to patrol. Suddenly nazguls surrounded us. We tried to fight but they just throw us. They wounded me and finally Strider came back. Strider drove out nazguls. He tended to wound but suddenly we saw elven woman. So Rivendell was not far away. She took Frodo and rode to Rivendell. I hope Frodo will be fine.',
              time: 'October 4, 3018',
              ready: true
            },
            Frodo: {
              text: 'Strider went to patrol. Suddenly nazguls surrounded us. We tried to fight but they just throw us. They wounded me and finally Strider came back. Strider drove out nazguls. He tended to wound but suddenly we saw elven woman. So Rivendell was not far away. She took me to Rivendell.',
              time: 'October 4, 3018',
              ready: true
            }
          }
        },
        {
          name: 'Rivendell',
          text: 'Arwen brings Frodo to Rivendell. Nazguls can\'t get across the river the Rivendell boundary.',
          time: '3018/10/20 15:00',
          characters: {
            Aragorn: {
              text: 'We went to Rivendell as far as we can. Fortunately Arwen successfully brought Frodo to Rivendell. We saw dead rider horses down the river. For some time nazguls will not bother us. Elves gave us a shelter. Gandalf is already in Rivendell. Elrond will heal Frodo. We will wait and when Frodo will be fine we will make the Ring council.',
              time: 'October 20, 3018',
              ready: true
            },
            Arwen: {
              text: 'I took Frodo and fortunately we came across the boundary river in time. Black riders tried to go across the river and river sweep them. For some time they will not bother Frodo. Father healed Frodo but nazgul\'s wounds can\'t be healed completely.',
              time: 'October 20, 3018',
              ready: true
            },
            Bilbo: {
              text: 'I heard my nephew with several friends came to Rivendell. Brave guys. I hope Frodo visit me. Perhaps his journey only begin and couple items... are not very useful for me so I will give it to him. I\'m already in Rivendell. What a wonderful land.',
              time: 'October 20, 3018',
              ready: true
            },
            Gandalf: {
              text: 'Arwen saved Frodo. I will heal him but it take some time. Now we sure black riders can\'t find way into Rivendell. Saruman left our side. Orthanc is orcs land now and nobody knows how strong Saruman\'s black magic is. Soon we will make the Ring council and decide what we can do.',
              time: 'October 20, 3018',
              ready: true
            },
            Merry: {
              text: 'We went to Rivendell as far as we can. Fortunately Arwen successfully brought Frodo to Rivendell. We saw dead rider horses down the river. For some time nazguls will not bother us. Elves gave us a shelter. Gandalf is already in Rivendell. Elrond will heal Frodo. We will wait for Frodo healing.',
              time: 'October 20, 3018',
              ready: true
            },
            Nazgul: {
              text: 'Elf brought Frodo to Rivendell. We can\'t find the way into the Rivendell. Ancient magic is still alive. The Lord ordered to come back to Mordor. We will know what to do next there.',
              time: 'October 20, 3018',
              ready: true
            },
            Pippin: {
              text: 'We went to Rivendell as far as we can. Fortunately Arwen successfully brought Frodo to Rivendell. We saw dead rider horses down the river. For some time nazguls will not bother us. Elves gave us a shelter. Gandalf is already in Rivendell. Elrond will heal Frodo. We will wait for Frodo healing.',
              time: 'October 20, 3018',
              ready: true
            },
            Sam: {
              text: 'We went to Rivendell as far as we can. Fortunately Arwen successfully brought Frodo to Rivendell. We saw dead rider horses down the river. For some time nazguls will not bother us. Elves gave us a shelter. Gandalf is already in Rivendell. Elrond will heal Frodo. We will wait for Frodo healing.',
              time: 'October 20, 3018',
              ready: true
            },
            Frodo: {
              text: 'I didn\'t remember how I came to Rivendell. I came to life already here. All my followers are in Rivendell too.',
              time: 'October 20, 3018',
              ready: true
            },
            Elrond: {
              text: 'Arwen saved Frodo. I will heal him but it take some time. Now we sure black riders can\'t find way into Rivendell. Soon we will make the Ring council and decide what we can do.',
              time: 'October 20, 3018',
              ready: true
            }
          }
        },
        {
          name: 'the Ring in Revendell',
          text: 'Frodo is cured. Frodo meets Bilbo and gets the last inherit. The sword and the Dwarven mail.',
          time: '3018/12/24 16:00',
          characters: {
            Bilbo: {
              text: 'Frodo visited me and I gave the last part of inheritance - sword and mail. Sword and mail served me well. Now they will serve Frodo. When I saw the Ring I asked Frodo to give it to me for a second but he hide it. I became angry and again quiet very fast. I don\'t know what happen with me.',
              time: 'December 24, 3018',
              ready: true
            },
            Frodo: {
              text: 'I visited Bilbo in Rivendell. He is looking very old now. Bilbo gave me his sword and mail - magic items. I don\'t want to try them in action but it is better to have it. Bilbo asked to to show the Ring and suddenly became angry when I refused. He changed so quickly and became quiet again in a second. Now I know how what is the Ring stamp on the Ring-bearer which holds it too much time.',
              time: 'December 24, 3018',
              ready: true
            }
          }
        }
      ]
    }
  },
  Settings: {
    BriefingPreview: {
      characterName: 'Aragorn'
    },
    Stories: {
      storyName: 'The fellowship of the Ring'
    },
    CharacterProfile: {
      characterName: 'People of Gondor'
    },
    Events: {
      storyName: 'Journey begins',
      characterNames: [
        'Aragorn',
        'Arwen',
        'Bilbo',
        'Elrond',
        'Frodo',
        'Gandalf',
        'Merry',
        'Nazgul',
        'Pippin',
        'Sam',
        'Saruman',
        'Sauron'
      ],
      eventIndexes: [],
      selectedFilter: 'adaptationFilterByCharacter'
    },
    GroupProfile: {
      groupName: 'People of Gondor'
    }
  },
  Version: '0.7.2',
  Log: [
    [
      'user',
      'Mon Aug 01 2016 01:11:26 GMT+0500 (Pakistan Standard Time)',
      'getDatabase',
      '[]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:35:38 GMT+0500 (Pakistan Standard Time)',
      'createCharacter',
      '["People of Gondor"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:35:45 GMT+0500 (Pakistan Standard Time)',
      'createCharacter',
      '["People of Rohan"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:36:48 GMT+0500 (Pakistan Standard Time)',
      'createProfileItem',
      '["Side","enum","_",true,11]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:36:57 GMT+0500 (Pakistan Standard Time)',
      'moveProfileItem',
      '[11,0]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:37:17 GMT+0500 (Pakistan Standard Time)',
      'updateDefaultValue',
      '["Side","Dark,Light,Neutral"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:37:34 GMT+0500 (Pakistan Standard Time)',
      'createProfileItem',
      '["People of Gondor","checkbox",false,true,12]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:37:39 GMT+0500 (Pakistan Standard Time)',
      'createProfileItem',
      '["People of Rohan","checkbox",false,true,13]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:40:42 GMT+0500 (Pakistan Standard Time)',
      'createGroup',
      '["People of Gondor"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:40:52 GMT+0500 (Pakistan Standard Time)',
      'createGroup',
      '["People of Rohan"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:41:02 GMT+0500 (Pakistan Standard Time)',
      'createGroup',
      '["Neutrals"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:41:06 GMT+0500 (Pakistan Standard Time)',
      'createGroup',
      '["Elves"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:41:17 GMT+0500 (Pakistan Standard Time)',
      'createGroup',
      '["Light side"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:41:22 GMT+0500 (Pakistan Standard Time)',
      'createGroup',
      '["Dark side"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:42:03 GMT+0500 (Pakistan Standard Time)',
      'saveFilterToGroup',
      '["People of Gondor",[{"type":"checkbox","name":"profile-People of Gondor","selectedOptions":{"true":true}}]]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:42:33 GMT+0500 (Pakistan Standard Time)',
      'saveFilterToGroup',
      '["People of Rohan",[{"type":"checkbox","name":"profile-People of Rohan","selectedOptions":{"true":true}}]]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:42:43 GMT+0500 (Pakistan Standard Time)',
      'saveFilterToGroup',
      '["Neutrals",[{"type":"enum","name":"profile-Side","selectedOptions":{"Neutral":true}}]]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:43:19 GMT+0500 (Pakistan Standard Time)',
      'saveFilterToGroup',
      '["Light side",[{"type":"enum","name":"profile-Side","selectedOptions":{"Light":true}}]]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:43:36 GMT+0500 (Pakistan Standard Time)',
      'saveFilterToGroup',
      '["Dark side",[{"type":"enum","name":"profile-Side","selectedOptions":{"Dark":true}}]]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:43:47 GMT+0500 (Pakistan Standard Time)',
      'saveFilterToGroup',
      '["Elves",[{"type":"enum","name":"profile-Side","selectedOptions":{"Light":true}},{"type":"enum","name":"profile-Race","selectedOptions":{"Elf":true}}]]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:47:35 GMT+0500 (Pakistan Standard Time)',
      'addBoardGroup',
      '["Dark side"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:47:38 GMT+0500 (Pakistan Standard Time)',
      'addBoardGroup',
      '["Elves"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:47:41 GMT+0500 (Pakistan Standard Time)',
      'addBoardGroup',
      '["Light side"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:47:46 GMT+0500 (Pakistan Standard Time)',
      'addBoardGroup',
      '["Neutrals"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:47:50 GMT+0500 (Pakistan Standard Time)',
      'addBoardGroup',
      '["People of Gondor"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:47:54 GMT+0500 (Pakistan Standard Time)',
      'addBoardGroup',
      '["People of Rohan"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:48:08 GMT+0500 (Pakistan Standard Time)',
      'createResource',
      '["Mines of Moria"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:48:20 GMT+0500 (Pakistan Standard Time)',
      'createResource',
      '["The One Ring"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:48:35 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-Dark side","resource-The One Ring","Controls"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:48:48 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-People of Gondor","resource-The One Ring","Want to use"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:49:03 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-Dark side","group-Light side","Want destroy"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:49:08 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-Light side","group-Dark side","Want destroy"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:49:25 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-Dark side","group-Neutrals","Want to enslave"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:49:36 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-Light side","group-Neutrals","Want to join"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:49:49 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-Elves","group-Light side","Directs"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:50:19 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-Light side","resource-The One Ring","Want to destroy"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:50:46 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-People of Rohan","group-People of Gondor","ally"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:50:51 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-People of Gondor","group-People of Rohan","ally"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:51:49 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-People of Rohan","group-Light side","incline"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:51:55 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-People of Gondor","group-Light side","incline"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:52:16 GMT+0500 (Pakistan Standard Time)',
      'setEdgeLabel',
      '["group-Dark side","resource-The One Ring","Want to get"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:52:24 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-Dark side","resource-Mines of Moria","Controls"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:52:54 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-People of Gondor","resource-Mines of Moria","Want to capture"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:53:21 GMT+0500 (Pakistan Standard Time)',
      'addEdge',
      '["group-Neutrals","resource-The One Ring","Want to use"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:53:34 GMT+0500 (Pakistan Standard Time)',
      'removeEdge',
      '["group-People of Gondor","resource-The One Ring"]',
      '["begin"]'
    ],
    [
      'user',
      'Thu Dec 08 2016 04:53:36 GMT+0500 (Pakistan Standard Time)',
      'setEdgeLabel',
      '["group-People of Gondor","resource-The One Ring","Want to use"]',
      '["begin"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:35:56 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:35:56 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:36:34 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:36:34 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:36:37 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:36:37 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:36:40 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:36:40 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:36:42 GMT+0500 (Екатеринбург, стандартное время)',
      'setMetaInfoString',
      '["description","Film based LARP game basis. This base describes the first film from trilogy The Lord of the Rings. Timeline is taken from books."]',
      '["begin"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:36:42 GMT+0500 (Екатеринбург, стандартное время)',
      'setMetaInfoString',
      '["description","Film based LARP game basis. This base describes the first film from trilogy The Lord of the Rings. Timeline is taken from books."]',
      '["Fri Jul 20 2018 03:36:42 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:37:41 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:37:41 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:38:03 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:38:03 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:39:08 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:39:08 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:53:55 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:53:55 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:55:57 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:55:57 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:57:12 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:57:12 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:57:20 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:57:20 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:58:08 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:58:08 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 03:59:56 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 03:59:56 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 04:03:51 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 04:03:51 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 04:08:03 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 04:08:03 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 04:08:15 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 04:08:15 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 04:09:07 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 04:09:07 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 04:09:51 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 04:09:51 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 04:15:52 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 04:15:52 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Fri Jul 20 2018 04:16:20 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Fri Jul 20 2018 04:16:20 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 04:42:34 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 04:42:34 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 04:43:26 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 04:43:26 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:04:39 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:04:39 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:14:39 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:14:39 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:15:23 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:15:23 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:18:02 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:18:02 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:19:42 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:19:42 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:20:04 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:20:04 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:20:57 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:20:57 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:23:05 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:23:05 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:23:38 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:23:38 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:24:32 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:24:32 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:27:20 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:27:20 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 05:27:31 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 05:27:31 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 13:25:54 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 13:25:54 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 13:26:25 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 13:26:25 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sat Jul 21 2018 17:58:38 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sat Jul 21 2018 17:58:38 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:57:58 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sun Jul 22 2018 02:57:58 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:58:17 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfile',
      '["character","People of Gondor"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:58:17 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfile',
      '["character","People of Gondor"]',
      '["Sun Jul 22 2018 02:58:17 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:58:19 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfile',
      '["character","People of Rohan"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:58:19 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfile',
      '["character","People of Rohan"]',
      '["Sun Jul 22 2018 02:58:19 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:58:48 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfile',
      '["player","John"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:58:48 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfile',
      '["player","John"]',
      '["Sun Jul 22 2018 02:58:48 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:58:53 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfile',
      '["player","Evan"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:58:53 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfile',
      '["player","Evan"]',
      '["Sun Jul 22 2018 02:58:53 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:59:00 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfile',
      '["player","Marie"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:59:00 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfile',
      '["player","Marie"]',
      '["Sun Jul 22 2018 02:59:00 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:59:08 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfile',
      '["player","Bella"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:59:08 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfile',
      '["player","Bella"]',
      '["Sun Jul 22 2018 02:59:08 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:59:48 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfileItem',
      '["player","City","enum",0]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 02:59:48 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfileItem',
      '["player","City","enum",0]',
      '["Sun Jul 22 2018 02:59:48 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:00:20 GMT+0500 (Екатеринбург, стандартное время)',
      'updateDefaultValue',
      '["player","City","unknown,Moscow,New York,London,Paris"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:00:20 GMT+0500 (Екатеринбург, стандартное время)',
      'updateDefaultValue',
      '["player","City","unknown,Moscow,New York,London,Paris"]',
      '["Sun Jul 22 2018 03:00:20 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:01:19 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfileItem',
      '["player","Communication channel","multiEnum",1]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:01:19 GMT+0500 (Екатеринбург, стандартное время)',
      'createProfileItem',
      '["player","Communication channel","multiEnum",1]',
      '["Sun Jul 22 2018 03:01:19 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:14 GMT+0500 (Екатеринбург, стандартное время)',
      'updateDefaultValue',
      '["player","Communication channel","Smoke signals,IM,post,telegraph,phone,email"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:14 GMT+0500 (Екатеринбург, стандартное время)',
      'updateDefaultValue',
      '["player","Communication channel","Smoke signals,IM,post,telegraph,phone,email"]',
      '["Sun Jul 22 2018 03:02:14 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:18 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Bella","Communication channel","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:18 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Bella","Communication channel","multiEnum",""]',
      '["Sun Jul 22 2018 03:02:18 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:26 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Bella","City","enum","Moscow"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:26 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Bella","City","enum","Moscow"]',
      '["Sun Jul 22 2018 03:02:26 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:28 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Bella","Communication channel","multiEnum","Smoke signals"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:28 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Bella","Communication channel","multiEnum","Smoke signals"]',
      '["Sun Jul 22 2018 03:02:28 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:29 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Bella","Communication channel","multiEnum","phone,Smoke signals"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:29 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Bella","Communication channel","multiEnum","phone,Smoke signals"]',
      '["Sun Jul 22 2018 03:02:29 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:30 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Evan","Communication channel","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:30 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Evan","Communication channel","multiEnum",""]',
      '["Sun Jul 22 2018 03:02:30 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:31 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Evan","City","enum","New York"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:31 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Evan","City","enum","New York"]',
      '["Sun Jul 22 2018 03:02:31 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:33 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Evan","Communication channel","multiEnum","phone"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:33 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Evan","Communication channel","multiEnum","phone"]',
      '["Sun Jul 22 2018 03:02:33 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:55 GMT+0500 (Екатеринбург, стандартное время)',
      'createBinding',
      '["Arwen","Bella"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:55 GMT+0500 (Екатеринбург, стандартное время)',
      'createBinding',
      '["Arwen","Bella"]',
      '["Sun Jul 22 2018 03:02:55 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:57 GMT+0500 (Екатеринбург, стандартное время)',
      'createBinding',
      '["Aragorn","John"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:57 GMT+0500 (Екатеринбург, стандартное время)',
      'createBinding',
      '["Aragorn","John"]',
      '["Sun Jul 22 2018 03:02:57 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:59 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Evan","Communication channel","multiEnum","phone"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:02:59 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["player","Evan","Communication channel","multiEnum","phone"]',
      '["Sun Jul 22 2018 03:02:59 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:03:39 GMT+0500 (Екатеринбург, стандартное время)',
      'setCharacterRelationText',
      '["Aragorn","Sauron","Sauron","You will not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king."]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:03:39 GMT+0500 (Екатеринбург, стандартное время)',
      'setCharacterRelationText',
      '["Aragorn","Sauron","Sauron","You will not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king."]',
      '["Sun Jul 22 2018 03:03:39 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:03:48 GMT+0500 (Екатеринбург, стандартное время)',
      'setCharacterRelationText',
      '["Aragorn","Sauron","Sauron","You will not be the king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king."]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:03:48 GMT+0500 (Екатеринбург, стандартное время)',
      'setCharacterRelationText',
      '["Aragorn","Sauron","Sauron","You will not be the king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king. You wil not be a king."]',
      '["Sun Jul 22 2018 03:03:48 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:08 GMT+0500 (Екатеринбург, стандартное время)',
      'setCharacterRelationText',
      '["Aragorn","Sauron","Sauron","You will not be the king. You will not be the king. You will not be the king. You will not be the king. You will not be the king. You will not be the king. You will not be the king."]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:08 GMT+0500 (Екатеринбург, стандартное время)',
      'setCharacterRelationText',
      '["Aragorn","Sauron","Sauron","You will not be the king. You will not be the king. You will not be the king. You will not be the king. You will not be the king. You will not be the king. You will not be the king."]',
      '["Sun Jul 22 2018 03:04:08 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:18 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Arwen","Aragorn",true]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:18 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Arwen","Aragorn",true]',
      '["Sun Jul 22 2018 03:04:18 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:19 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Arwen","Arwen",true]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:19 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Arwen","Arwen",true]',
      '["Sun Jul 22 2018 03:04:19 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:19 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationEssenceStatus',
      '["Aragorn","Arwen","allies",true]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:19 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationEssenceStatus',
      '["Aragorn","Arwen","allies",true]',
      '["Sun Jul 22 2018 03:04:19 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:35 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Gandalf","Gandalf",true]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:35 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Gandalf","Gandalf",true]',
      '["Sun Jul 22 2018 03:04:35 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:36 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationEssenceStatus',
      '["Aragorn","Gandalf","enderToStarter",true]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:36 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationEssenceStatus',
      '["Aragorn","Gandalf","enderToStarter",true]',
      '["Sun Jul 22 2018 03:04:36 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:38 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Gandalf","Gandalf",false]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:38 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Gandalf","Gandalf",false]',
      '["Sun Jul 22 2018 03:04:38 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:39 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Gandalf","Aragorn",true]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:39 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationReadyStatus',
      '["Aragorn","Gandalf","Aragorn",true]',
      '["Sun Jul 22 2018 03:04:39 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:40 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationEssenceStatus',
      '["Aragorn","Gandalf","starterToEnder",true]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:40 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationEssenceStatus',
      '["Aragorn","Gandalf","starterToEnder",true]',
      '["Sun Jul 22 2018 03:04:40 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:41 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationEssenceStatus',
      '["Aragorn","Gandalf","enderToStarter",false]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:04:41 GMT+0500 (Екатеринбург, стандартное время)',
      'setRelationEssenceStatus',
      '["Aragorn","Gandalf","enderToStarter",false]',
      '["Sun Jul 22 2018 03:04:41 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:05:32 GMT+0500 (Екатеринбург, стандартное время)',
      'createGroup',
      '["Swords and bows"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:05:32 GMT+0500 (Екатеринбург, стандартное время)',
      'createGroup',
      '["Swords and bows"]',
      '["Sun Jul 22 2018 03:05:32 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:06:47 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","People of Gondor","checkbox",true]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:06:47 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","People of Gondor","checkbox",true]',
      '["Sun Jul 22 2018 03:06:47 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:07:46 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfileItem',
      '["character",1,"Player"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:07:46 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfileItem',
      '["character",1,"Player"]',
      '["Sun Jul 22 2018 03:07:46 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:08:10 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfileItem',
      '["character",10,"Site image"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:08:10 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfileItem',
      '["character",10,"Site image"]',
      '["Sun Jul 22 2018 03:08:10 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:08:13 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfileItem',
      '["character",9,"VKontakte image"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:08:13 GMT+0500 (Екатеринбург, стандартное время)',
      'removeProfileItem',
      '["character",9,"VKontakte image"]',
      '["Sun Jul 22 2018 03:08:13 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:08:37 GMT+0500 (Екатеринбург, стандартное время)',
      'changeProfileItemType',
      '["character","Weapon","multiEnum"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:08:37 GMT+0500 (Екатеринбург, стандартное время)',
      'changeProfileItemType',
      '["character","Weapon","multiEnum"]',
      '["Sun Jul 22 2018 03:08:37 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:23 GMT+0500 (Екатеринбург, стандартное время)',
      'updateDefaultValue',
      '["character","Weapon","Chestnuts,Bow,Magic,Sword,Knifw,Staff,Axe,Elven knifes"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:23 GMT+0500 (Екатеринбург, стандартное время)',
      'updateDefaultValue',
      '["character","Weapon","Chestnuts,Bow,Magic,Sword,Knifw,Staff,Axe,Elven knifes"]',
      '["Sun Jul 22 2018 03:09:23 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:25 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:25 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:09:25 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:42 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Axe"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:42 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Axe"]',
      '["Sun Jul 22 2018 03:09:42 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:44 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:44 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:09:44 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:46 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:46 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow"]',
      '["Sun Jul 22 2018 03:09:46 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:52 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow,Sword"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:52 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow,Sword"]',
      '["Sun Jul 22 2018 03:09:52 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:54 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow,Knifw,Sword"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:09:54 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow,Knifw,Sword"]',
      '["Sun Jul 22 2018 03:09:54 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:02 GMT+0500 (Екатеринбург, стандартное время)',
      'renameEnumValue',
      '["character","Weapon","Knifw","Knife"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:02 GMT+0500 (Екатеринбург, стандартное время)',
      'renameEnumValue',
      '["character","Weapon","Knifw","Knife"]',
      '["Sun Jul 22 2018 03:10:02 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:04 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow,Knife,Sword"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:04 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow,Knife,Sword"]',
      '["Sun Jul 22 2018 03:10:04 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:12 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Bilbo","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:12 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Bilbo","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:10:12 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:14 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Bilbo","Weapon","multiEnum","Chestnuts"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:14 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Bilbo","Weapon","multiEnum","Chestnuts"]',
      '["Sun Jul 22 2018 03:10:14 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:15 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Bilbo","Weapon","multiEnum","Chestnuts,Sword"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:15 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Bilbo","Weapon","multiEnum","Chestnuts,Sword"]',
      '["Sun Jul 22 2018 03:10:15 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:19 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Elrond","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:19 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Elrond","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:10:19 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:19 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Boromir","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:19 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Boromir","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:10:19 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:22 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Boromir","Weapon","multiEnum","Bow"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:22 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Boromir","Weapon","multiEnum","Bow"]',
      '["Sun Jul 22 2018 03:10:22 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:23 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Boromir","Weapon","multiEnum","Bow,Sword"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:23 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Boromir","Weapon","multiEnum","Bow,Sword"]',
      '["Sun Jul 22 2018 03:10:23 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:29 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gimli","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:29 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gimli","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:10:29 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:32 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gimli","Weapon","multiEnum","Axe"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:32 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gimli","Weapon","multiEnum","Axe"]',
      '["Sun Jul 22 2018 03:10:32 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:37 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gandalf","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:37 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gandalf","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:10:37 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:39 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gandalf","Weapon","multiEnum","Magic"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:39 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gandalf","Weapon","multiEnum","Magic"]',
      '["Sun Jul 22 2018 03:10:39 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:41 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gandalf","Weapon","multiEnum","Magic,Staff"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:10:41 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Gandalf","Weapon","multiEnum","Magic,Staff"]',
      '["Sun Jul 22 2018 03:10:41 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:06 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Legolas","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:06 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Legolas","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:11:06 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:09 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Legolas","Weapon","multiEnum","Bow"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:09 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Legolas","Weapon","multiEnum","Bow"]',
      '["Sun Jul 22 2018 03:11:09 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:10 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Legolas","Weapon","multiEnum","Bow,Elven knifes"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:10 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Legolas","Weapon","multiEnum","Bow,Elven knifes"]',
      '["Sun Jul 22 2018 03:11:10 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:17 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Merry","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:17 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Merry","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:11:17 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:19 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Merry","Weapon","multiEnum","Chestnuts"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:19 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Merry","Weapon","multiEnum","Chestnuts"]',
      '["Sun Jul 22 2018 03:11:19 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:25 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Pippin","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:25 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Pippin","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:11:25 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:27 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Pippin","Weapon","multiEnum","Chestnuts"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:27 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Pippin","Weapon","multiEnum","Chestnuts"]',
      '["Sun Jul 22 2018 03:11:27 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:28 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Saruman","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:28 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Saruman","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:11:28 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:34 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Saruman","Weapon","multiEnum","Magic"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:34 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Saruman","Weapon","multiEnum","Magic"]',
      '["Sun Jul 22 2018 03:11:34 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:36 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Saruman","Weapon","multiEnum","Magic,Staff"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:36 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Saruman","Weapon","multiEnum","Magic,Staff"]',
      '["Sun Jul 22 2018 03:11:36 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:42 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Sam","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:42 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Sam","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:11:42 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:43 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Sam","Weapon","multiEnum","Chestnuts"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:43 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Sam","Weapon","multiEnum","Chestnuts"]',
      '["Sun Jul 22 2018 03:11:43 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:52 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Frodo","Weapon","multiEnum",""]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:52 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Frodo","Weapon","multiEnum",""]',
      '["Sun Jul 22 2018 03:11:52 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:54 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Frodo","Weapon","multiEnum","Chestnuts"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:11:54 GMT+0500 (Екатеринбург, стандартное время)',
      'updateProfileField',
      '["character","Frodo","Weapon","multiEnum","Chestnuts"]',
      '["Sun Jul 22 2018 03:11:54 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:12:25 GMT+0500 (Екатеринбург, стандартное время)',
      'saveFilterToGroup',
      '["Swords and bows",[{"type":"multiEnum","name":"profile-Weapon","condition":"some","selectedOptions":{"Bow":true,"Sword":true}}]]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 03:12:25 GMT+0500 (Екатеринбург, стандартное время)',
      'saveFilterToGroup',
      '["Swords and bows",[{"type":"multiEnum","name":"profile-Weapon","condition":"some","selectedOptions":{"Bow":true,"Sword":true}}]]',
      '["Sun Jul 22 2018 03:12:25 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:04:47 GMT+0500 (Екатеринбург, стандартное время)',
      'setDatabase',
      '[]',
      '["Sun Jul 22 2018 16:04:47 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:05:45 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Openness","Transparency","Secrecy"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:05:45 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Openness","Transparency","Secrecy"]',
      '["Sun Jul 22 2018 16:05:45 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:05:52 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Mechanics","Intrusive","Discreet"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:05:52 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Mechanics","Intrusive","Discreet"]',
      '["Sun Jul 22 2018 16:05:52 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:04 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Environment","360° Illusion","Material Independence"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:04 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Environment","360° Illusion","Material Independence"]',
      '["Sun Jul 22 2018 16:06:04 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:11 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Character Creation Responsibility","Organizer","Player"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:11 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Character Creation Responsibility","Organizer","Player"]',
      '["Sun Jul 22 2018 16:06:11 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:21 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Culture Creation Responsiblity","Organizer","Player"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:21 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Culture Creation Responsiblity","Organizer","Player"]',
      '["Sun Jul 22 2018 16:06:21 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:29 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Runtime Direction","Active","Passive"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:29 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Runtime Direction","Active","Passive"]',
      '["Sun Jul 22 2018 16:06:29 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:37 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Loyalty to the World","Plausibility","Playability"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:37 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Loyalty to the World","Plausibility","Playability"]',
      '["Sun Jul 22 2018 16:06:37 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:45 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Pressure on Players","Hardcore","Pretence"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:45 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Pressure on Players","Hardcore","Pretence"]',
      '["Sun Jul 22 2018 16:06:45 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:54 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Player Motivation","Victory","Exploration"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:06:54 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Player Motivation","Victory","Exploration"]',
      '["Sun Jul 22 2018 16:06:54 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:07:03 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Character as Mask","Differentiation","Thin Characters"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:07:03 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Character as Mask","Differentiation","Thin Characters"]',
      '["Sun Jul 22 2018 16:07:03 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:07:11 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Communication Style","Verbal","Physical"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:07:11 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Communication Style","Verbal","Physical"]',
      '["Sun Jul 22 2018 16:07:11 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:07:18 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Representation of Theme","Stories","Actions"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:07:18 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Representation of Theme","Stories","Actions"]',
      '["Sun Jul 22 2018 16:07:18 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:07:29 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Your Fader Here","Maximum","Minimum"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:07:29 GMT+0500 (Екатеринбург, стандартное время)',
      'createSlider',
      '["Your Fader Here","Maximum","Minimum"]',
      '["Sun Jul 22 2018 16:07:29 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:08:20 GMT+0500 (Екатеринбург, стандартное время)',
      'updateSliderNaming',
      '[12,"Your Slider Here","Maximum","Minimum"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jul 22 2018 16:08:20 GMT+0500 (Екатеринбург, стандартное время)',
      'updateSliderNaming',
      '[12,"Your Slider Here","Maximum","Minimum"]',
      '["Sun Jul 22 2018 16:08:20 GMT+0500 (Екатеринбург, стандартное время)","OK"]'
    ],
    [
      'user',
      'Sun Jun 23 2019 17:21:22 GMT+0200 (Центральная Европа, летнее время)',
      'setDatabase',
      '[]',
      '["Sun Jun 23 2019 17:21:22 GMT+0200 (Центральная Европа, летнее время)","OK"]'
    ],
    [
      'user',
      'Sun Jun 23 2019 17:27:11 GMT+0200 (Центральная Европа, летнее время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow,Knife,Sword"]',
      '["begin"]'
    ],
    [
      'user',
      'Sun Jun 23 2019 17:27:11 GMT+0200 (Центральная Европа, летнее время)',
      'updateProfileField',
      '["character","Aragorn","Weapon","multiEnum","Bow,Knife,Sword"]',
      '["Sun Jun 23 2019 17:27:11 GMT+0200 (Центральная Европа, летнее время)","OK"]'
    ]
  ],
  Groups: {
    'People of Gondor': {
      name: 'People of Gondor',
      masterDescription: '',
      characterDescription: 'During the first millennium of the Third Age, Gondor was victorious in war and its wealth and power grew. After Sauron\'s defeat, Gondor watched over Mordor. In T.A. 490, Gondor\'s centuries-old peace was ended by the first of many Easterling invasions.[1] That war lasted into the following century, and from it Gondor conquered much territory in Rhûn north of Mordor.\n\nUnder the rule of the four "Ship-Kings", Gondor established a powerful navy and extended along the coast from the Mouths of Anduin. In 933,[1] Gondor captured the southern port city Umbar, formerly held by the hostile Black Númenóreans. Later, the Haradrim defeated Gondor on land and besieged Umbar; but King Hyarmendacil I strengthened his army and navy, and forced the kings of Harad to submit after a great victory in T.A. 1050.\n\nGondor reached its peak during the reign of Hyarmendacil, controlling a vast territory and holding suzerainty over neighbouring nations such as the Haradrim and the northern Men of the Vales of Anduin. Mordor was desolate and guarded by fortresses. Under Hyarmendacil I\'s successor, Atanatar the Glorious, The kingdom enjoyed such wealth and splendour that, according to The Lord of the Rings, "men said precious stones are pebbles in Gondor for children to play with".[4]',
      filterModel: [
        {
          type: 'checkbox',
          name: 'profile-People of Gondor',
          selectedOptions: {
            true: true
          }
        }
      ],
      doExport: true
    },
    'People of Rohan': {
      name: 'People of Rohan',
      masterDescription: '',
      characterDescription: 'In the thirteenth century of the Third Age (T.A.), the Kings of Gondor made close alliances with the Northmen of Rhovanion, a people said in The Lord of the Rings to be akin to the Three Houses of Men (later the Dúnedain) from the First Age.\n\nIn the twenty-first century, a remnant tribe of such Northmen calling itself the Éothéod moved from the valleys of Anduin to the north west of Mirkwood, clearing out what remained of the recently defeated witch kingdom of Angmar, east of the Misty Mountains. While there, some dispute arose between them and the Dwarves over the treasure-hoard of Scatha the dragon.\n\nLater, in 2509, Cirion the Steward of Gondor sent summons to the Éothéod for aid in throwing off a combined invasion of Men from the north east of Middle-earth, and Orcs from Mordor.\n\nEorl the Young, king of the Éothéod, answered the summons, and arrived unexpected at a decisive battle at the Field of Celebrant, routing the orc army, and then destroying it as it fled.\n\nAs a reward, Eorl was given the plains of Calenardhon, and he moved his kingdom there. This land had earlier been part of Gondor proper, but had been devastated by the plague of 1636, and the survivors to a large extent slain in the invasion mentioned above.',
      filterModel: [
        {
          type: 'checkbox',
          name: 'profile-People of Rohan',
          selectedOptions: {
            true: true
          }
        }
      ],
      doExport: true
    },
    Neutrals: {
      name: 'Neutrals',
      masterDescription: 'They have choice and they don\'t do it yet.',
      characterDescription: '',
      filterModel: [
        {
          type: 'enum',
          name: 'profile-Side',
          selectedOptions: {
            Neutral: true
          }
        }
      ],
      doExport: true
    },
    Elves: {
      name: 'Elves',
      masterDescription: 'Our way is Valinor.',
      characterDescription: '',
      filterModel: [
        {
          type: 'enum',
          name: 'profile-Side',
          selectedOptions: {
            Light: true
          }
        },
        {
          type: 'enum',
          name: 'profile-Race',
          selectedOptions: {
            Elf: true
          }
        }
      ],
      doExport: true
    },
    'Light side': {
      name: 'Light side',
      masterDescription: 'Want to destroy Sauron and his harm to Middle-earth.',
      characterDescription: '',
      filterModel: [
        {
          type: 'enum',
          name: 'profile-Side',
          selectedOptions: {
            Light: true
          }
        }
      ],
      doExport: true
    },
    'Dark side': {
      name: 'Dark side',
      masterDescription: 'Want to control Arda.',
      characterDescription: '',
      filterModel: [
        {
          type: 'enum',
          name: 'profile-Side',
          selectedOptions: {
            Dark: true
          }
        }
      ],
      doExport: true
    },
    'Swords and bows': {
      name: 'Swords and bows',
      masterDescription: '',
      characterDescription: '',
      filterModel: [
        {
          type: 'multiEnum',
          name: 'profile-Weapon',
          condition: 'some',
          selectedOptions: {
            Bow: true,
            Sword: true
          }
        }
      ],
      doExport: true
    }
  },
  InvestigationBoard: {
    groups: {
      'Dark side': {
        name: 'Dark side',
        notes: ''
      },
      Elves: {
        name: 'Elves',
        notes: ''
      },
      'Light side': {
        name: 'Light side',
        notes: ''
      },
      Neutrals: {
        name: 'Neutrals',
        notes: ''
      },
      'People of Gondor': {
        name: 'People of Gondor',
        notes: ''
      },
      'People of Rohan': {
        name: 'People of Rohan',
        notes: ''
      }
    },
    resources: {
      'Mines of Moria': {
        name: 'Mines of Moria'
      },
      'The One Ring': {
        name: 'The One Ring'
      }
    },
    relations: {
      'group-Dark side': {
        'resource-The One Ring': 'Want to get',
        'group-Light side': 'Want destroy',
        'group-Neutrals': 'Want to enslave',
        'resource-Mines of Moria': 'Controls'
      },
      'group-Elves': {
        'group-Light side': 'Directs'
      },
      'group-Light side': {
        'group-Dark side': 'Want destroy',
        'group-Neutrals': 'Want to join',
        'resource-The One Ring': 'Want to destroy'
      },
      'group-Neutrals': {
        'resource-The One Ring': 'Want to use'
      },
      'group-People of Gondor': {
        'group-People of Rohan': 'ally',
        'group-Light side': 'incline',
        'resource-Mines of Moria': 'Want to capture'
      },
      'group-People of Rohan': {
        'group-People of Gondor': 'ally',
        'group-Light side': 'incline'
      }
    }
  },
  Relations: [
    {
      origin: '',
      starterTextReady: true,
      enderTextReady: false,
      essence: [
        'starterToEnder'
      ],
      Aragorn: 'My respect.',
      Gandalf: '',
      starter: 'Aragorn',
      ender: 'Gandalf'
    },
    {
      origin: '',
      starterTextReady: true,
      enderTextReady: true,
      essence: [
        'allies'
      ],
      Aragorn: 'My shiny.',
      Arwen: 'My tiger.',
      starter: 'Aragorn',
      ender: 'Arwen'
    },
    {
      origin: '',
      starterTextReady: false,
      enderTextReady: false,
      essence: [],
      Sauron: 'You will not be the king. You will not be the king. You will not be the king. You will not be the king. You will not be the king. You will not be the king. You will not be the king.',
      Aragorn: '',
      starter: 'Sauron',
      ender: 'Aragorn'
    }
  ],
  CharacterProfileStructure: [
    {
      name: 'Side',
      type: 'enum',
      value: 'Dark,Light,Neutral',
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'Status',
      type: 'enum',
      value: 'Open,Reserved,In discussion',
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'Race',
      type: 'enum',
      value: 'Human,Elf,Dwarf,Orc,Hobbit,Maiar,Other',
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'Civility',
      type: 'enum',
      value: 'doesn\'t matter,M,F',
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'Weapon',
      type: 'multiEnum',
      value: 'Chestnuts,Bow,Magic,Sword,Knife,Staff,Axe,Elven knifes',
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'Outfit',
      type: 'string',
      value: '',
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'Weight, kilos.',
      type: 'number',
      value: 0,
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'Sing good',
      type: 'checkbox',
      value: false,
      doExport: false,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'Biography',
      type: 'text',
      value: '',
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'People of Gondor',
      type: 'checkbox',
      value: false,
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'People of Rohan',
      type: 'checkbox',
      value: false,
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    }
  ],
  PlayerProfileStructure: [
    {
      name: 'City',
      type: 'enum',
      value: 'unknown,Moscow,New York,London,Paris',
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    },
    {
      name: 'Communication channel',
      type: 'multiEnum',
      value: 'Smoke signals,IM,post,telegraph,phone,email',
      doExport: true,
      playerAccess: 'hidden',
      showInRoleGrid: false
    }
  ],
  Players: {
    John: {
      name: 'John',
      City: 'unknown',
      'Communication channel': ''
    },
    Evan: {
      name: 'Evan',
      City: 'New York',
      'Communication channel': 'phone'
    },
    Marie: {
      name: 'Marie',
      City: 'unknown',
      'Communication channel': ''
    },
    Bella: {
      name: 'Bella',
      City: 'Moscow',
      'Communication channel': 'phone,Smoke signals'
    }
  },
  ProfileBindings: {
    Arwen: 'Bella',
    Aragorn: 'John'
  },
  Gears: {
    nodes: [
      {
        id: '0812a02f-7951-41d3-81b8-21bded1c67c5',
        x: -138,
        y: -11,
        label: 'THE MESSAGE\n\nWhat’s the game abou\nt?\nWhat story does it t\nell?\nWhat questions does \nit pose?',
        name: 'THE MESSAGE',
        group: 'The Engine (Vision)',
        notes: 'What’s the game about?\nWhat story does it tell?\nWhat questions does it pose?',
        shape: 'box'
      },
      {
        id: '2112865a-3a91-4c2c-a3ae-ab928721c926',
        x: -99,
        y: -211,
        label: 'THE AESTHETICS\n\nWhat does the game l\nook like?\nWhat senses does it \nengage?\nWhich element will t\nhe players remember \nand why?',
        name: 'THE AESTHETICS',
        group: 'The Engine (Vision)',
        notes: 'What does the game look like?\nWhat senses does it engage?\nWhich element will the players remember and why?',
        shape: 'box'
      },
      {
        id: '43dadc80-2084-4a70-b072-52a3fc285491',
        x: -314,
        y: -213,
        label: 'PLAYERS\' EXPERIENCE\n\nWhat emotions and st\nates do the players \nexperience during th\ne game? \nWhat relations do th\ney form?\nWhat is left in them\n after the game, wha\nt do they remember?',
        name: 'PLAYERS\' EXPERIENCE',
        group: 'The Engine (Vision)',
        notes: 'What emotions and states do the players experience during the game? \nWhat relations do they form?\nWhat is left in them after the game, what do they remember?',
        shape: 'box'
      },
      {
        id: 'e8387ac5-b29b-4f79-a3f0-c26a7180de50',
        x: -402,
        y: 13,
        label: 'PLAYERS\' ACTIONS\n\nWhat is the most imp\nortant for them duri\nng the game?\nWhat physical action\ns do they perform?\nWhat character inter\nactions can happen (\nrivalry or cooperati\non)?',
        name: 'PLAYERS\' ACTIONS',
        group: 'The Engine (Vision)',
        notes: 'What is the most important for them during the game?\nWhat physical actions do they perform?\nWhat character interactions can happen (rivalry or cooperation)?',
        shape: 'box'
      },
      {
        id: 'd9028776-70b6-4e62-832f-e07ab30199cf',
        x: 108,
        y: -217,
        label: 'THE TIME\n\nDoes it take place a\nt a specific time of\n day? \nHow is it timed, if \nat all (and how do p\nlayers experience th\nat)?\nAre there any pre-pl\nanned events?',
        name: 'THE TIME',
        group: 'The Interface (Manipulation)',
        notes: 'Does it take place at a specific time of day? \nHow is it timed, if at all (and how do players experience that)?\nAre there any pre-planned events?',
        shape: 'box'
      },
      {
        id: '74fd7243-18aa-47e6-9684-35a16efbf513',
        x: -415,
        y: -450,
        label: 'THE PLACE\n\nWhere is the game lo\ncated?\nHow does the space d\nelimit the game, if \nat all? \nDo you need special \nspace (like blackbox\nes) and how will you\n use it?',
        name: 'THE PLACE',
        group: 'The Interface (Manipulation)',
        notes: 'Where is the game located?\nHow does the space delimit the game, if at all? \nDo you need special space (like blackboxes) and how will you use it?',
        shape: 'box'
      },
      {
        id: 'ec10124b-12ff-4ccd-9555-4143c0aae0ac',
        x: -159,
        y: -461,
        label: 'SCENOGRAPHY\n\nRealistic or symboli\nc?\nWhat are the key ele\nments? \nHow can you use the \nscenography to play \n(what actions can th\ne players perform wi\nth it)?\nWhat ideas does the \nscenography convey?',
        name: 'SCENOGRAPHY',
        group: 'The Interface (Manipulation)',
        notes: 'Realistic or symbolic?\nWhat are the key elements? \nHow can you use the scenography to play (what actions can the players perform with it)?\nWhat ideas does the scenography convey?',
        shape: 'box'
      },
      {
        id: 'f5477161-87f2-45f6-ba60-5a1c40bdb558',
        x: -521,
        y: -256,
        label: 'GAME CHARACTERS\n\nDo the players creat\ne them, or you? \nIf you – how? (Writt\nen sheets, other mea\nns?) \nHow will they commun\nicate the desirable \ninteractions?',
        name: 'GAME CHARACTERS',
        group: 'The Interface (Manipulation)',
        notes: 'Do the players create them, or you? \nIf you – how? (Written sheets, other means?) \nHow will they communicate the desirable interactions?',
        shape: 'box'
      },
      {
        id: '9431a054-0c17-44e7-a3a1-8364e3a2e9cb',
        x: 116,
        y: -413,
        label: 'OFF-GAME ELEMENTS\n\nWhere will the playe\nrs sleep, how will t\nhey eat? \nHow does that influe\nnce the game experie\nnce?\nCan you do it differ\nently?',
        name: 'OFF-GAME ELEMENTS',
        group: 'The Interface (Manipulation)',
        notes: 'Where will the players sleep, how will they eat? \nHow does that influence the game experience?\nCan you do it differently?',
        shape: 'box'
      },
      {
        id: 'a52f0d31-5b33-4936-a981-ed80f152439d',
        x: 221,
        y: -608,
        label: 'EXPECTATIONS TOWARDS PLAYERS\n\nHow do they prepare \nfor the game? \nWhat attitudes and b\nehaviours do you exp\nect before the game,\n what behaviour duri\nng and afterwards?',
        name: 'EXPECTATIONS TOWARDS PLAYERS',
        group: 'The Packaging (Communication)',
        notes: 'How do they prepare for the game? \nWhat attitudes and behaviours do you expect before the game, what behaviour during and afterwards?',
        shape: 'box'
      },
      {
        id: '6ec5f1b3-dd76-455a-8ad0-af3678d3e7a3',
        x: -68,
        y: -649,
        label: 'THE GAME PROCESS\n\nDo you moderate the \ngame?\nHow much? \nWhich elements are k\nnown to the players,\n which should be sec\nret?',
        name: 'THE GAME PROCESS',
        group: 'The Packaging (Communication)',
        notes: 'Do you moderate the game?\nHow much? \nWhich elements are known to the players, which should be secret?',
        shape: 'box'
      },
      {
        id: 'f4c3dfd6-062a-43d6-9ab1-235553064cca',
        x: -367,
        y: -678,
        label: 'THE GAME RULES\n\nWhat game mechanics \nhelp lead the player\ns to the Vision, if \nany? \nWhat are the rules o\nf engagement and saf\nety rules? \nWhich rule could you\n forgot if you had t\no? Why?',
        name: 'THE GAME RULES',
        group: 'The Packaging (Communication)',
        notes: 'What game mechanics help lead the players to the Vision, if any? \nWhat are the rules of engagement and safety rules? \nWhich rule could you forgot if you had to? Why?',
        shape: 'box'
      },
      {
        id: 'd06d709a-51af-4967-b13f-2800297c0ce4',
        x: -660,
        y: -644,
        label: 'THE GAME UNIVERSE (DIEGESIS)\n\nWhich elements are c\nrucial for the playe\nrs? \nWhich elements lead \nthem to the Vision?',
        name: 'THE GAME UNIVERSE (DIEGESIS)',
        group: 'The Packaging (Communication)',
        notes: 'Which elements are crucial for the players? \nWhich elements lead them to the Vision?',
        shape: 'box'
      },
      {
        id: 'ce7f9930-d7b6-4ebc-892a-b97de4821fdc',
        x: -790,
        y: -391,
        label: 'COMMUNICATION WITH PLAYERS\n\nWhat communication c\nhannels do you use? \nWhat is the ratio of\n in-game information\n to technical descri\nptions?\nDo the players commu\nnicate before the ga\nme, and how do you i\nnfluence that?',
        name: 'COMMUNICATION WITH PLAYERS',
        group: 'The Packaging (Communication)',
        notes: 'What communication channels do you use? \nWhat is the ratio of in-game information to technical descriptions?\nDo the players communicate before the game, and how do you influence that?',
        shape: 'box'
      },
      {
        id: '5ae739b0-7bf6-495c-8cee-dd91d570ce63',
        x: -784,
        y: 51,
        label: 'EMPTY CARD\n\nWhy is this element \nimportant?\nWhat do you want to \nachieve through it?',
        name: 'EMPTY CARD',
        group: 'Unassigned',
        notes: 'Why is this element important?\nWhat do you want to achieve through it?',
        shape: 'box'
      }
    ],
    edges: [],
    settings: {
      physicsEnabled: false,
      showNotes: true
    }
  },
  Sliders: [
    {
      name: 'Openness',
      top: 'Transparency',
      bottom: 'Secrecy',
      value: 0
    },
    {
      name: 'Mechanics',
      top: 'Intrusive',
      bottom: 'Discreet',
      value: 0
    },
    {
      name: 'Environment',
      top: '360° Illusion',
      bottom: 'Material Independence',
      value: 0
    },
    {
      name: 'Character Creation Responsibility',
      top: 'Organizer',
      bottom: 'Player',
      value: 0
    },
    {
      name: 'Culture Creation Responsiblity',
      top: 'Organizer',
      bottom: 'Player',
      value: 0
    },
    {
      name: 'Runtime Direction',
      top: 'Active',
      bottom: 'Passive',
      value: 0
    },
    {
      name: 'Loyalty to the World',
      top: 'Plausibility',
      bottom: 'Playability',
      value: 0
    },
    {
      name: 'Pressure on Players',
      top: 'Hardcore',
      bottom: 'Pretence',
      value: 0
    },
    {
      name: 'Player Motivation',
      top: 'Victory',
      bottom: 'Exploration',
      value: 0
    },
    {
      name: 'Character as Mask',
      top: 'Differentiation',
      bottom: 'Thin Characters',
      value: 0
    },
    {
      name: 'Communication Style',
      top: 'Verbal',
      bottom: 'Physical',
      value: 0
    },
    {
      name: 'Representation of Theme',
      top: 'Stories',
      bottom: 'Actions',
      value: 0
    },
    {
      name: 'Your Slider Here',
      top: 'Maximum',
      bottom: 'Minimum',
      value: 0
    }
  ]
};

// })(typeof exports === 'undefined'? this['DemoBase']={}: exports);
