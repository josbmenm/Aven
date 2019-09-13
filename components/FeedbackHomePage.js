import React from 'react';
import { View, StyleSheet, Image, Text, TouchableOpacity } from 'react-native';
import {
  proseFontFace,
  monsterra,
  boldPrimaryFontFace,
  prettyShadowSmall,
  titleStyle,
  monsterra80,
} from '../components/Styles';
import FadeTransition from '../components/FadeTransition';
import BlockFormButton from '../components/BlockFormButton';
import Animated, {
  Transitioning,
  Transition,
  Easing,
} from 'react-native-reanimated';

const STAR_EMPTY = require('./assets/StarEmpty.png');
const STAR_FULL = require('./assets/StarFull.png');

const FEEDBACK_TITLES = {
  [1]: 'terrible.',
  [2]: 'pretty bad.',
  [3]: 'a decent experience.',
  [4]: 'pretty good.',
  [5]: 'transcendent!',
};
const FEEDBACK_TAGS = [
  {
    name: 'taste',
    positiveTitle: 'Blend was tasty',
    positiveMessage: 'My order was fresh and delicious',
    neutralTitle: 'Blend tasted ok',
    neutralMessage: 'My order was decent, but nothing to write home about',
    negativeTitle: 'Blend tasted gross',
    negativeMessage: 'My order tasted like garbage',
  },
  {
    name: 'hospitality',
    positiveTitle: 'Amazing Hospitality',
    positiveMessage: 'The customer experience was fantastic',
    neutralTitle: 'Didn’t love the hospitality',
    neutralMessage: 'The customer experience was subpar',
    negativeTitle: 'Your guides are bad/mean',
    negativeMessage: 'The customer experience was horrible',
  },
  {
    name: 'experience',
    positiveTitle: 'Delightful Experience',
    positiveMessage: 'The restaurant was such a fun experience',
    neutralTitle: 'Kludgy Experience',
    neutralMessage: 'The restaurant experience was awkward',
    negativeTitle: 'Bad Restaurant Experience',
    negativeMessage: 'The restaurant experience was awkward or confusing',
  },
  {
    name: 'speed',
    positiveTitle: 'Ferociously Fast',
    positiveMessage: 'The order experience was fast AF',
    neutralTitle: 'Not fast enough',
    neutralMessage: 'I thought I’d get my order quicker than I did',
    negativeTitle: 'A snails pace',
    negativeMessage: 'My order was sooo slow.',
  },
  {
    name: 'ordering',
    positiveTitle: 'Flawless ordering app',
    positiveMessage: 'The ordering experience was top notch',
    neutralTitle: 'A bit confusing when ordering',
    neutralMessage: 'The ordering experience was a bit difficult or perplexing',
    negativeTitle: 'Bad ordering experience',
    negativeMessage: 'The ordering experience is difficult or perplexing',
  },
  {
    name: 'other',
    positiveTitle: 'Other',
    positiveMessage: 'Something else worth sharing',
    neutralTitle: 'Other',
    neutralMessage: 'Something else worth sharing',
    negativeTitle: 'Other',
    negativeMessage: 'Something else worth sharing',
  },
];

function SubmitButton({ onPress }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 30,
      }}
    >
      <BlockFormButton
        style={{ flex: null }}
        onPress={onPress}
        title="submit"
      />
    </View>
  );
}

function TagsGroup({ children }) {
  return (
    <View
      style={{
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
      }}
    >
      {children}
    </View>
  );
}

function Tag({ title, isSelected, onPress, message }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      style={{
        ...prettyShadowSmall,
      }}
    >
      <View
        style={{
          width: 444,
          height: 114,
          margin: 10,
          backgroundColor: 'white',
          borderRadius: 4,
          borderWidth: 3,
          borderColor: isSelected ? monsterra : 'white',
          justifyContent: 'center',
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ ...titleStyle, fontSize: 20 }}>
          {title.toUpperCase()}
        </Text>
        <Text style={{ ...proseFontFace, color: monsterra, fontSize: 18 }}>
          {message}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
function RatingStars({ rating, onRating }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 24,
      }}
    >
      {Array(5)
        .fill(1)
        .map((_, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                onRating(index + 1);
              }}
            >
              <Image
                style={{
                  resizeMode: 'contain',
                  width: 100,
                  height: 100,
                  margin: 30,
                  tintColor: '#FFD518',
                }}
                source={rating > index ? STAR_FULL : STAR_EMPTY}
              />
            </TouchableOpacity>
          );
        })}
    </View>
  );
}

function getTitleOfTag(tagSpec, sentiment) {
  if (sentiment === 'positive') return tagSpec.positiveTitle;
  if (sentiment === 'negative') return tagSpec.negativeTitle;
  return tagSpec.neutralTitle;
}

function getMessageOfTag(tagSpec, sentiment) {
  if (sentiment === 'positive') return tagSpec.positiveMessage;
  if (sentiment === 'negative') return tagSpec.negativeMessage;
  return tagSpec.neutralMessage;
}

function sentimentOfRating(r) {
  if (r < 3) return 'negative';
  if (r > 3) return 'positive';
  return 'neutral';
}

export default function FeedbackHomePage({ navigation, onSubmit, ...props }) {
  const [rating, setRating] = React.useState(0);
  const [tags, setTags] = React.useState([]);
  const [openProgress] = React.useState(new Animated.Value(0));
  const isReady = rating !== 0;
  const ratingSentiment = sentimentOfRating(rating);
  function handleRating(v) {
    const nextSentiment = sentimentOfRating(v);
    const sentimentChanged = ratingSentiment !== nextSentiment;
    setRating(v);
    sentimentChanged && setTags([]);
  }
  React.useEffect(() => {
    Animated.timing(openProgress, {
      toValue: Number(isReady),
      easing: Easing.inOut(Easing.quad),
      duration: 800,
    }).start();
  }, [isReady]);
  function handleSubmit() {
    onSubmit({
      ...Object.fromEntries(tags.map(tag => [tag, 1])),
      rating,
      tags,
    });
    setTags([]);
    setRating(0);
  }
  return (
    <FadeTransition
      {...props}
      navigation={navigation}
      background={
        <React.Fragment>
          <Animated.Image
            source={require('../components/assets/BgHome.png')}
            key="home"
            style={{
              width: null,
              height: null,
              resizeMode: 'contain',
              transform: [{ rotateY: '180deg' }],
              ...StyleSheet.absoluteFillObject,
            }}
          />
          <Animated.Image
            source={require('../components/assets/BgGeneric.png')}
            key="page"
            style={{
              width: null,
              height: null,
              resizeMode: 'contain',
              transform: [{ rotateY: '180deg' }],
              opacity: openProgress,
              ...StyleSheet.absoluteFillObject,
            }}
          />
        </React.Fragment>
      }
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Animated.View
          style={{
            opacity: openProgress.interpolate({
              inputRange: [0, 0.5],
              outputRange: [1, 0],
            }),
            position: 'absolute',
            left: 0,
            right: 0,
            top: 300,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              ...boldPrimaryFontFace,
              flex: 1,
              color: monsterra,
              fontSize: 52,
            }}
          >
            food for thought
          </Text>
          <Text style={{ color: monsterra, ...proseFontFace, fontSize: 32 }}>
            Rate your experience, and your next blend is free.
          </Text>
        </Animated.View>

        <Animated.View
          style={{
            opacity: openProgress.interpolate({
              inputRange: [0.4, 0.7],
              outputRange: [0, 1],
            }),
          }}
        >
          <Text
            style={{
              ...boldPrimaryFontFace,
              textAlign: 'center',
              color: monsterra,
              fontSize: 42,
            }}
          >
            {FEEDBACK_TITLES[rating]}
          </Text>
          <Text
            style={{
              ...proseFontFace,
              textAlign: 'center',
              color: monsterra,
              fontSize: 24,
              marginVertical: 8,
            }}
          >
            Select all that apply
          </Text>
        </Animated.View>
        <Animated.View
          style={{
            zIndex: 12,
            transform: [
              {
                translateY: openProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [240, 0],
                }),
              },
            ],
          }}
        >
          <RatingStars rating={rating} onRating={handleRating} />
        </Animated.View>
        <Animated.View
          style={{
            opacity: openProgress.interpolate({
              inputRange: [0.5, 1],
              outputRange: [0, 1],
            }),
          }}
        >
          <TagsGroup>
            {FEEDBACK_TAGS.map(tagSpec => {
              const tagId = `${ratingSentiment}-${tagSpec.name}`;
              const hasTag = tags.indexOf(tagId) !== -1;
              const message = getMessageOfTag(tagSpec, ratingSentiment);
              const title = getTitleOfTag(tagSpec, ratingSentiment);
              return (
                <Tag
                  title={title}
                  message={message}
                  onPress={() => {
                    if (hasTag) {
                      setTags(tags.filter(t => t !== tagId));
                    } else {
                      setTags([...tags, tagId]);
                    }
                  }}
                  isSelected={hasTag}
                />
              );
            })}
          </TagsGroup>
          <SubmitButton onPress={handleSubmit} />
        </Animated.View>
      </View>
    </FadeTransition>
  );
}

FeedbackHomePage.navigationOptions = FadeTransition.navigationOptions;
