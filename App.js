import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { ClockScreen } from "./src/features/clock/ClockScreen";
import { HistoryScreen } from "./src/features/history/HistoryScreen";
import { PayScreen } from "./src/features/pay/PayScreen";
import { SettingsScreen } from "./src/features/settings/SettingsScreen";
import { findOpenShift } from "./src/services/domain";
import { StoreProvider, useStore } from "./src/services/StoreContext";
import { useAppFonts } from "./src/shared/fonts";
import { Spinning, useReducedMotion } from "./src/shared/motion";
import { colors, fonts } from "./src/shared/theme";
import { GriptapeFill } from "./src/shared/ui/Griptape";
import { Icon } from "./src/shared/ui/Icon";

const TABS = [
  { id: "clock", label: "Clock", icon: "clock" },
  { id: "history", label: "Hours", icon: "hours" },
  { id: "pay", label: "Pay", icon: "pay" },
  { id: "settings", label: "Settings", icon: "settings" },
];

function TabButton({ item, active, onPress, spinning }) {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(active ? 1.08 : 1)).current;

  useEffect(() => {
    if (reduced) {
      scale.setValue(active ? 1.08 : 1);
      return;
    }
    Animated.timing(scale, {
      toValue: active ? 1.12 : 1,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [active, reduced, scale]);

  const ink = active ? colors.bone : colors.maple;
  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={spinning ? `${item.label}, still on` : item.label}
    >
      <Animated.View
        style={[
          styles.tabIcon,
          active && styles.tabIconOn,
          { transform: [{ scale }] },
        ]}
      >
        <Spinning on={spinning}>
          <Icon name={item.icon} color={ink} size={22} />
        </Spinning>
      </Animated.View>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
    </Pressable>
  );
}

function AppShell() {
  const [tab, setTab] = useState("clock");
  const { ready, store, loadError, saveError, reload } = useStore();
  const clockedIn = Boolean(store && findOpenShift(store.shifts));

  return (
    <View style={styles.safe}>
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
        <GriptapeFill />
        {TABS.map((item) => (
          <TabButton
            key={item.id}
            item={item}
            active={tab === item.id}
            spinning={item.id === "clock" && clockedIn}
            onPress={() => setTab(item.id)}
          />
        ))}
      </View>
    </View>
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
    letterSpacing: 1,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
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
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: Platform.OS === "web" ? "max(6px, calc(env(safe-area-inset-bottom) * 0.35))" : 6,
    backgroundColor: colors.griptape,
    overflow: "hidden",
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    zIndex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabIcon: {
    width: 40,
    height: 40,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2c2823",
    borderWidth: 1.5,
    borderColor: "#5a5348",
  },
  tabIconOn: {
    backgroundColor: colors.primary,
    borderColor: colors.maple,
  },
  tabLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: "#d2c8b8",
    letterSpacing: 0.4,
  },
  tabLabelActive: {
    fontFamily: fonts.bodyBold,
    color: colors.bone,
  },
});
