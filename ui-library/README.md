# Ono food component library

- This UI Library is a set of cross-platform components capable of render on iOS, Android and web almost with the identical API.
- there are 3 type of components: `Primitives` or `literal`, `Layout` or `position` and `Context`.

- Primitives:
  _ basic components anyone can use (text, headings, buttons…)
  _ this are the typo of components that an end user would use quite often.

- Layout:
  _ responsable of layout and spacing of the primitive components
  _ very tied to what and what’s not possible to apply

- Context:
  _ components in charge of modifying and changing theme context with the new values passed to override.
  _ this components can be composable and uses component composition to share the new theme passed to its children.

- MUST: accessibility to all the components, specially the ones that needs to follow a certain value on our themes.

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

## Questions

- What if we add types to components and depending on the `type`, it will get the appropriate styles (the text inside button use case: color white but default text is black”)
- how granular should the context classes should be?
- what if those context classes are tied to a specific components?
- component sizing usually is tied to the combination of different components around it, how do we handle this with a context component?

## First impressions

- it feels really weird to add a new component to change something o a specific component
- it feels a lot as global styles and specificity, dunno if its good or bad (seems to be bad tho)
- having all the "values" tied to a same variable (maybe a base number where other values will rely on) it's a really interesting idea. it's preety close to what `em` and `rem` does on the web maybe?

## Component Examples

### Primitives

- Button
- Input
- Heading
- ButtonLink
- Text
- Image
- Link
- Input
- ...

### Layout

- Spacing
- HorizontalStack
- VerticalStack
- Row
- Section
- Column
- ...

### Context

- Context (default)
- ColorInvert
- Scale
- ...

---

## Components

### Button

#### usage

```javascript

// Default button
<Button title=“default button” onPress={() => {}} />

// Outline Button
<Button type=“outline” title=“outline button” onPress={() => {}} />

// ButtonText
// <ButtonText title=“button text” onPress={() => {}} />

```
