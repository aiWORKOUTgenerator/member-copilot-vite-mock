import React from 'react';
import { RatingScaleWrapper, TextInputWrapper } from '../components/customization';

// Rating Scale Component Factory
const createRatingScaleComponent = (config) => (props) => (
  <RatingScaleWrapper
    value={props.value}
    onChange={props.onChange}
    userProfile={props.userProfile}
    config={config}
    enableAI={true}
  />
);

export const EnergyComponent = createRatingScaleComponent({
  min: 1,
  max: 5,
  labels: {
    low: 'Low Energy',
    high: 'High Energy',
    scale: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
  },
  size: 'md',
  showLabels: true,
  showValue: true
});

export const SleepComponent = createRatingScaleComponent({
  min: 1,
  max: 5,
  labels: {
    low: 'Poor Sleep',
    high: 'Great Sleep',
    scale: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
  },
  size: 'md',
  showLabels: true,
  showValue: true
});

// Text Input Component Factory
const createTextInputComponent = (type) => (props) => (
  <TextInputWrapper
    value={props.value}
    onChange={props.onChange}
    userProfile={props.userProfile}
    type={type}
    enableAI={true}
  />
);

export const IncludeComponent = createTextInputComponent('include');
export const ExcludeComponent = createTextInputComponent('exclude'); 