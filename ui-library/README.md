# Ono food component library

- This UI Library is a set of cross-platform components capable of render on iOS, Android and web almost with the identical API.
- there are 5 type of components: `Primitives`, `literal`, `Composite`, `Layout` & `Context`.

## Primitives

- React Native (web) components.
- this are the components that we use to apply any styles.
- Not exported, used internally ONLY.
- the only type of component that CAN accept the `style` prop

## Literals

- basic components anyone can use (text, button, input, …)
- this are the type of components that an end user would use quite often.
- this is the base component that users will need to create custom components
- this components accept a special `theme` prop. This prop allows the literal component to _override_ theme values consumed by itself.
- this components can have special values in the theme, for example (buttonColor, buttonBackground, textColor). That way it would be easier to component comsumers to override certain values on their custom components

### Literal components Examples

- [x] Button
- [x] ButtonLink
- [x] Link
- [ ] Input
- [ ] Text
- [ ] Image
- [ ] Input
- [ ] Label
- [ ] Spinner
- [ ] Switch

- ...

## Composite Components

### Composite components examples

- [ ] Row
- [ ] Section
- [ ] Column
- [ ] Heading
- [ ] Multi-select
- ...

## Layout

- responsable of layout and spacing of the literal or composite components
- very tied to what and what’s not possible to apply

### Layout component Examples

- Spacing
- Stack (horizontal prop) controls the spacing between the children components
- ...

---

## Context

- Components that change theme values to all the underlying components (all children).

### Context components Examples

- Context (default)
- ColorInvert
- Scale
- ...

---

---

## Theme

JSON object with the values that will be applied to all our components. What we need to define on our theme are:

### color(s)

We need a consistent way to name colors depending on which colors you are using. it does not matter what we are rendering, usually we have a `foreground` color and a `background` color. The key here is to generate ways to component users to define those colors on a theme, and then those colors will be applied to our Primitives components.

other values we can/need to define on our theme:

- base space value (8)
- spacing?
- shadows?
- borders?
- fontSizes?
- fontFamilies?
- breakpoints? (devices?)

## Considerations

- MUST: accessibility to all the components, specially the ones that needs to follow a certain value on our themes.

## Questions

- how can I add something extra to my custom component with the theme API?. Examples:
  - CodeBlock borders; how do I apply the border to my Literal View component?
  - Button: how do I capitalize the text of my custom button?

## First impressions

- it feels really weird to add a new component to change something o a specific component
- it feels a lot as global styles and specificity, dunno if its good or bad (seems to be bad tho)
- having all the "values" tied to a same variable (maybe a base number where other values will rely on) it's a really interesting idea. it's preety close to what `em` and `rem` does on the web maybe?

## Feedback

- ~~theme should be one level~~
- ~~literal components should not compose each other~~
- ~~no context or literal comps should overlap~~
- ~~outline prop as boolean~~
- ~~to override or create a specific component, we need to accept on all literal comps a `theme` prop. this theme prop will be merge with the original theme on the `useTheme` hook~~
- new type of component: `composite components`: examples of components that override the theme using the comp prop, so people can learn how to create their own components (example: Title)
- make lineHeight calculation on Text
