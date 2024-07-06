import { filter, find, get, head, includes } from "lodash";
import { LANGUAGES } from "../constants";

const orderVoices = (voices: { name: string; lang: string }[]): SpeechSynthesisVoice[] => {
  const multilingualVoices = filter(voices, (voice) =>
    includes(get(voice, ["name"]), "Multilingual")
  );
  const bosnianNaturalVoices = filter(
    voices,
    (voice) =>
      includes(get(voice, ["lang"]), "bs-BA") && includes(get(voice, ["name"]), "(Natural)")
  );
  const croatianNaturalVoices = filter(
    voices,
    (voice) =>
      includes(get(voice, ["lang"]), "hr-HR") && includes(get(voice, ["name"]), "(Natural)")
  );
  const ukNaturalVoices = filter(
    voices,
    (voice) =>
      includes(get(voice, ["lang"]), "en-GB") && includes(get(voice, ["name"]), "(Natural)")
  );
  const usNaturalVoices = filter(
    voices,
    (voice) =>
      includes(get(voice, ["lang"]), "en-US") &&
      includes(get(voice, ["name"]), "(Natural)") &&
      !includes(get(voice, ["name"]), "Multilingual")
  );
  const remainnigVoices = filter(
    voices,
    (voice) =>
      !includes(get(voice, ["name"]), "(Natural)") &&
      !includes(get(voice, ["name"]), "Multilingual")
  );

  // Concatenate All Extracted Lists
  const orderedVoices = [
    ...multilingualVoices,
    ...bosnianNaturalVoices,
    ...croatianNaturalVoices,
    ...ukNaturalVoices,
    ...usNaturalVoices,
    ...remainnigVoices,
  ];

  return orderedVoices as SpeechSynthesisVoice[];
};

export const getVoices = () => {
  const voices = speechSynthesis.getVoices();
  const filteredVoices = filter(voices, (voice) => LANGUAGES.includes(voice.lang));
  const orderedVoices = orderVoices(filteredVoices);
  return orderedVoices;
};

export const getVoice = (name: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice => {
  const voice = find(voices, (voices) => voices.name === name);
  return voice || (head(voices) as SpeechSynthesisVoice);
};
