import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { titleStyle, monsterra, boldPrimaryFontFace, black8 } from './Styles';
import { ScrollView } from 'react-native-gesture-handler';

import Animated from 'react-native-reanimated';

const defaultApplyValue = (v, dest) => v.setValue(dest);

function useAnimatedValue(currentValue, applyValue = defaultApplyValue) {
  const [val] = useState(new Animated.Value(currentValue));
  useEffect(() => {
    applyValue(val, currentValue);
  }, [currentValue]);
  return val;
}

function TabBarButton({ title, onPress, isActive }) {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={{
          paddingBottom: 10,
          paddingHorizontal: 14,
          paddingTop: 1,
        }}
      >
        <Animated.View
          style={{
            position: 'absolute',
            height: 3,
            backgroundColor: isActive ? monsterra : 'transparent',
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <Text
          style={{
            ...boldPrimaryFontFace,
            fontSize: 24,
            color: monsterra,
          }}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function TabSectionScrollView({
  sections,
  style,
  activeSection,
  onActiveSection,
  contentContainerStyle,
}) {
  const [sectionMeasurements, setSectionMeasurements] = useState({});
  const [scrollViewLayout, setScrollViewLayout] = useState(null);
  const scrollRef = useRef();
  const lastSectionName = sections[sections.length - 1].name;
  const spacerHeight = useAnimatedValue(
    scrollViewLayout && sectionMeasurements[lastSectionName]
      ? scrollViewLayout.height - sectionMeasurements[lastSectionName].height
      : 0,
  );
  function onSectionLayout(sectionName, measurements) {
    sectionMeasurements[sectionName] = measurements;
    if (Object.keys(sectionMeasurements).length === sections.length) {
      // hacky way to ensure that only one render happens as a result of all layouts:
      setSectionMeasurements(sectionMeasurements);
    }
  }
  // useEffect(() => {
  //   if (sectionMeasurements[activeSection.name] != null && scrollRef.current) {
  //     scrollRef.current
  //       .getScrollResponder()
  //       .scrollTo({ y: sectionMeasurements[activeSection.name].y });
  //   }
  // }, [activeSection, sectionMeasurements]);
  return (
    <React.Fragment>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignSelf: 'stretch',
          paddingHorizontal: 30,
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 30,
            right: 30,
            height: 1,
            backgroundColor: black8,
          }}
        />
        {sections.map(section => (
          <TabBarButton
            key={section.title}
            onPress={() => {
              if (
                sectionMeasurements[section.name] != null &&
                scrollRef.current
              ) {
                scrollRef.current
                  .getScrollResponder()
                  .scrollTo({ y: sectionMeasurements[section.name].y });
              }
              onActiveSection({ name: section.name });
            }}
            title={section.title}
            isActive={activeSection.name === section.name}
          />
        ))}
      </View>
      <ScrollView
        style={{ flex: 1, ...style }}
        ref={scrollRef}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        onLayout={e => {
          setScrollViewLayout(e.nativeEvent.layout);
        }}
        onScrollEndDrag={e => {
          const destOffsetY = e.nativeEvent.targetContentOffset.y;
          let closestSection = null;
          Object.keys(sectionMeasurements)
            .map(name => {
              return {
                name,
                distance:
                  sectionMeasurements[name] &&
                  Math.abs(sectionMeasurements[name].y - destOffsetY),
              };
            })
            .forEach(calculation => {
              if (
                calculation.distance &&
                (!closestSection ||
                  calculation.distance < closestSection.distance)
              ) {
                closestSection = calculation;
              }
            });
          closestSection && onActiveSection({ name: closestSection.name });
        }}
      >
        {sections.map((section, sectionIndex) => (
          <React.Fragment key={section.name}>
            {sectionIndex !== 0 && (
              <Text style={{ fontSize: 24, ...titleStyle }}>
                {section.title}
              </Text>
            )}
            <View
              style={{}}
              onLayout={e => {
                onSectionLayout(section.name, e.nativeEvent.layout);
              }}
            >
              {section.content}
            </View>
          </React.Fragment>
        ))}
        <Animated.View style={{ height: spacerHeight }} />
      </ScrollView>
    </React.Fragment>
  );
}
