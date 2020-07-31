import React from 'react';

export const SliderContainer = function () {
  return (
    <div className="col-x12123s-2 SliderContainer slider-container">
      <div className="slider-header slider-name" />
      <div className="slider-sublabel slider-top" />
      <div className="slider-body">
        <input />
      </div>
      <div className="slider-sublabel slider-bottom" />
      <div>
        <button
          type="button"
          className="btn btn-default btn-reduced fa-icon move transparent"
          l10n-title="sliders-move-slider"
        />
        <button
          type="button"
          className="btn btn-default btn-reduced fa-icon rename transparent"
          l10n-title="sliders-edit-slider"
        />
        <button
          type="button"
          className="btn btn-default btn-reduced fa-icon remove event transparent"
          l10n-title="sliders-remove-slider"
        />
      </div>
    </div>
  );
};

export function getSliderContainer() {
  return <SliderContainer />;
}
