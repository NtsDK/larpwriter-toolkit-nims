import { about_ru } from "./ru/about";
import { adaptations_ru } from "./ru/adaptations";
import { admins_ru } from "./ru/admins";
import { advices_ru } from "./ru/advices";
import { binding_ru } from "./ru/binding";
import { briefings_ru } from "./ru/briefings";
import { common_ru } from "./ru/common";
import { constant_ru } from "./ru/constant";
import { dialogs_ru } from "./ru/dialogs";
import { entity_ru } from "./ru/entity";
import { entrance_ru } from "./ru/entrance";
import { errors_ru } from "./ru/errors";
import { gears_ru } from "./ru/gears";
import { groups_ru } from "./ru/groups";
import { header_ru } from "./ru/header";
import { logViewer_ru } from "./ru/log-viewer";
import { overview_ru } from "./ru/overview";
import { profileFilter_ru } from "./ru/profile-filter";
import { profiles_ru } from "./ru/profiles";
import { roleGrid_ru } from "./ru/role-grid";
import { sliders_ru } from "./ru/sliders";
import { socialNetwork_ru } from "./ru/social-network";
import { stories_ru } from "./ru/stories";
import { textSearch_ru } from "./ru/text-search";
import { timeline_ru } from "./ru/timeline";
import { utils_ru } from "./ru/utils";

import { about_en } from "./en/about";
import { adaptations_en } from "./en/adaptations";
import { admins_en } from "./en/admins";
import { advices_en } from "./en/advices";
import { binding_en } from "./en/binding";
import { briefings_en } from "./en/briefings";
import { common_en } from "./en/common";
import { constant_en } from "./en/constant";
import { dialogs_en } from "./en/dialogs";
import { entity_en } from "./en/entity";
import { entrance_en } from "./en/entrance";
import { errors_en } from "./en/errors";
import { gears_en } from "./en/gears";
import { groups_en } from "./en/groups";
import { header_en } from "./en/header";
import { logViewer_en } from "./en/log-viewer";
import { overview_en } from "./en/overview";
import { profileFilter_en } from "./en/profile-filter";
import { profiles_en } from "./en/profiles";
import { roleGrid_en } from "./en/role-grid";
import { sliders_en } from "./en/sliders";
import { socialNetwork_en } from "./en/social-network";
import { stories_en } from "./en/stories";
import { textSearch_en } from "./en/text-search";
import { timeline_en } from "./en/timeline";
import { utils_en } from "./en/utils";

export const defaultLang = 'ru';

const dictionary_ru = {
  about: about_ru,
  adaptations: adaptations_ru,
  admins: admins_ru,
  advices: advices_ru,
  binding: binding_ru,
  briefings: briefings_ru,
  common: common_ru,
  constant: constant_ru,
  entity: entity_ru,
  entrance: entrance_ru,
  errors: errors_ru,
  gears: gears_ru,
  groups: groups_ru,
  header: header_ru,
  'log-viewer': logViewer_ru,
  overview: overview_ru,
  'profile-filter': profileFilter_ru,
  profiles: profiles_ru,
  'role-grid': roleGrid_ru,
  sliders: sliders_ru,
  'social-network': socialNetwork_ru,
  stories: stories_ru,
  'text-search': textSearch_ru,
  timeline: timeline_ru,
  utils: utils_ru,
  dialogs: dialogs_ru,
};

type DictionaryContent = typeof dictionary_ru;

const dictionary_en: DictionaryContent = {
  about: about_en,
  adaptations: adaptations_en,
  admins: admins_en,
  advices: advices_en,
  binding: binding_en,
  briefings: briefings_en,
  common: common_en,
  constant: constant_en,
  entity: entity_en,
  entrance: entrance_en,
  errors: errors_en,
  gears: gears_en,
  groups: groups_en,
  header: header_en,
  'log-viewer': logViewer_en,
  overview: overview_en,
  'profile-filter': profileFilter_en,
  profiles: profiles_en,
  'role-grid': roleGrid_en,
  sliders: sliders_en,
  'social-network': socialNetwork_en,
  stories: stories_en,
  'text-search': textSearch_en,
  timeline: timeline_en,
  utils: utils_en,
  dialogs: dialogs_en,
};

export const Dictionaries = {
  ru: dictionary_ru,
  en: dictionary_en,
};
