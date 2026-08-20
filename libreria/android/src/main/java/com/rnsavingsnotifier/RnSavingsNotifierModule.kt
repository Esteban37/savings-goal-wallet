package com.rnsavingsnotifier

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

class RnSavingsNotifierModule(reactContext: ReactApplicationContext) :
  NativeRnSavingsNotifierSpec(reactContext) {

  override fun notifyGoalCompleted(goalName: String, promise: Promise) {
    promise.resolve(null)
  }

  override fun showConfirmDialog(title: String, message: String, promise: Promise) {
    promise.resolve(true)
  }

  companion object {
    const val NAME: String = NativeRnSavingsNotifierSpec.NAME
  }
}
