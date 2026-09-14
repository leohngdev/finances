import { AzeretMono_600SemiBold } from "@expo-google-fonts/azeret-mono";
import { Cabin_400Regular, Cabin_500Medium, Cabin_600SemiBold, Cabin_700Bold } from "@expo-google-fonts/cabin";
import { Calistoga_400Regular } from "@expo-google-fonts/calistoga";
import { useFonts } from "expo-font";

export function useAppFonts() {
  const [loaded, error] = useFonts({
    Calistoga_400Regular,
    Cabin_400Regular,
    Cabin_500Medium,
    Cabin_600SemiBold,
    Cabin_700Bold,
    AzeretMono_600SemiBold,
  });
  return { loaded: loaded && !error, error };
}
