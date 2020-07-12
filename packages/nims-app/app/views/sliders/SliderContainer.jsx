import React from 'react';

export const SliderContainer = function() {
  return (
    <div className="col-x12123s-2 SliderContainer slider-container">
      <div className="slider-header slider-name"></div>
      <div className="slider-sublabel slider-top"></div>
      <div className="slider-body">
        <input/>
      </div>
      <div className="slider-sublabel slider-bottom"></div>
      <div>
        <button
          className="btn btn-default btn-reduced fa-icon move transparent"
          l10n-title="sliders-move-slider"></button>
        <button
          className="btn btn-default btn-reduced fa-icon rename transparent"
          l10n-title="sliders-edit-slider"></button>
        <button
          className="btn btn-default btn-reduced fa-icon remove event transparent"
          l10n-title="sliders-remove-slider"></button>
      </div>
    </div>
  );
};

export function getSliderContainer() {
  return <SliderContainer />;
}