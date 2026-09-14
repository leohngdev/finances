import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { ClockScreen } from "./src/features/clock/ClockScreen";
import { HistoryScreen } from "./src/features/history/HistoryScreen";
import { PayScreen } from "./src/features/pay/PayScreen";
import { SettingsScreen } from "./src/features/settings/SettingsScreen";
import { StoreProvider, useStore } from "./src/services/StoreContext";
import { useAppFonts } from "./src/shared/fonts";
import { colors, fonts } from "./src/shared/theme";

const TABS = [
  { id: "clock", label: "Clock" },
  { id: "history", label: "Hours" },
  { id: "pay", label: "Pay" },
  { id: "settings", label: "Settings" },
];

function AppShell() {
  const [tab, setTab] = useState("clock");
  const { ready, loadError, saveError, reload } = useStore();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {saveError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{saveError}</Text>
        </View>
      ) : null}
      <View style={styles.body}>
        {!ready ? (
          <View style={styles.center}>
            <Text style={styles.brand}>Logit</Text>
            <Text style={styles.muted}>Loading your hours…</Text>
          </View>
        ) : loadError ? (
          <View style={styles.center}>
            <Text style={styles.title}>Couldn’t load your hours</Text>
            <Text style={styles.muted}>{loadError}</Text>
            <Pressable onPress={reload} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {tab === "clock" ? (
              <ClockScreen
                onOpenSettings={() => setTab("settings")}
                onOpenHistory={() => setTab("history")}
                onOpenPay={() => setTab("pay")}
              />
            ) : null}
            {tab === "history" ? <HistoryScreen /> : null}
            {tab === "pay" ? <PayScreen /> : null}
            {tab === "settings" ? <SettingsScreen /> : null}
          </>
        )}
      </View>
      <View style={styles.tabs}>
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setTab(item.id)}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
              {active ? <View style={styles.tabMark} /> : <View style={styles.tabMarkEmpty} />}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const { loaded } = useAppFonts();
  if (!loaded) {
    return <View style={styles.boot} />;
  }
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  safe: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: colors.bg,
    paddingTop: Platform.OS === "web" ? "env(safe-area-inset-top)" : 0,
  },
  body: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 8,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 42,
    color: colors.primary,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.text,
    textAlign: "center",
  },
  muted: {
    fontFamily: fonts.body,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  retry: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
  },
  retryText: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerText: {
    fontFamily: fonts.bodySemi,
    color: colors.danger,
    textAlign: "center",
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === "web" ? "max(10px, env(safe-area-inset-bottom))" : 10,
    paddingTop: 8,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.muted,
  },
  tabLabelActive: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
  },
  tabMark: {
    width: 18,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  tabMarkEmpty: {
    width: 18,
    height: 3,
  },
});
