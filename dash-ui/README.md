# Dash UI: cross-platform UI Library built with React Native.

## Premise

- UI Libraries focus on the platform they are targeting too
- UI Libs APIs are tied to their implementation (CSS, flexbox model, responsiveness). This makes is difficult for someone that is not familiar to those implementations interact with it and understand it.
- Component APIs usually are too specific to the actual component, and that's understandable. the problem is that for someone that is not familiar with it or UI libraries, the learning curve is massive and very fragmented (N components, N APIs to learn)
- Composition is usually avoid on UI Libraries.
- themes handle more things that it should, with different shapes and nesting values, which makes it harder to catch/learn.

## Rules we "try" to follow on this UI Library

- Cross-platform. The components should work on both web and React native with any change. (thanks `react-native-web` :tada:)
- Themes only store values (tokens)
- Theme are only one level. easier to access data to
- The way to change components is via `Composition`.
- Accessibility is a key feature while creating/building the UI Library
- All components should have a way to "hijack" the styles and change the values. That's why this components expect a prop (optional) called `theme` that change the values that the current component uses in order to apply styles. Usually is pretty general, but sometimes can be specific (`Heading` example).
- the use of the `style` prop is a sign of a bad implementation/execution. We should avoid/encourage the use of the `style` prop.
- Components API should be as simple as possible (not too many props available), and as much coherent within each other as possible (the same API for similar components)
- the only way to apply colors to the components are view `theme.colorForeground` & `theme.colorBackground`.
- all components are fluid (they fill the space where they are rendered). the only way to limit components is using [`Layout components`](#layout-components) (explanation below).
- the naming should not be determine by the implementation. Avoid names that imply the way is being built now, and use more explicit names.

## Types of components

1. ### Literal Components

- The "Primitive" components.
- this are the smallest component possible on this UI lIbrary.
- They are implemented using the `react-native(-web)` components. this is the only type of component that can import `react-native(-web)` components.
- Styles applied is based on theme values directly.
- we still need a way to apply extra styles without exposing the style prop (TODO).

#### Examples

- [Text](./Text.js)
- [Heading](./Heading.js)
- [Button](./Button.js)
- [ButtonLink](./ButtonLink.js)
- [Link](./Link.js)

2. ### Layout Components

- Special components that the only task is to apply Layout, spacing and structure to other components.
- Not other components should apply any spacing or layout.

#### Examples:

- [Stack](./Stack.js)
- [Spacing](./Theme.js)

3. ### Context Components

- This components change theme values in a specific way, so childrens can get the appropiate theme values desired.
- They are composable (stack as much as you need)
- Useful components to change the aesthetics of a whole subtree of components

#### Examples

- [Large](./Large.js)
- [DarkMode](./Theme.js)

4. ### Composite Components

- Components created from other UI Library components for a specific task.
- They also serve as examples for Ui library users when they want to create their own custom components
- This is the recommended way to create custom components.

#### Examples

- [MultiSelect](./MultiSelect.js) (maybe a Literal component for ONO?)

## Components refactored using `dash-ui`

- [Hero](../components/Hero.js)
- [BackButton](../components/BackButton.js)
- [BlockFormHorizontalRule](../components/BlockFormHorizontalRule.js)
- [BlockFormMessage](../components/BlockFormMessage.js)
- [BlockFormRow](../components/BlockFormRow.js)
- [BlockFormTitle](../components/BlockFormTitle.js)
- [ButtonStack](../components/ButtonStack)
- [FeedbackReceiptPage](../components/FeedbackReceiptPage.js)
- [LinkRow](../components/LinkRow.js) (this one is using a normal view too (flex issue))
- [OnoTheme](../components/Onotheme.js) (ONO Theme, provider and Dark mode)
- [ReceiptPage](../components/ReceiptPage.js)
- [Row](../components/Row.js)
- [RowSection](../components/RowSection.js) (this one is using a normal view too (flex issue))
- [SendReceiptPage](../components/SendReceiptPage.js)
- [SharedIcon](../components/SharedIcon.js)
- [TextButton](../components/TextButton.js)

## Moved to dash-ui

- Tag
- Spinner
- SpinnerButton

There are other components that are now using theme values from the new one (Spinner, ActionPage...), but still using old components and accepting `style` prop.
