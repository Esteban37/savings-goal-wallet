package com.rnsavingsnotifier

import android.widget.Toast
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.UiThreadUtil

class RnSavingsNotifierModule(reactContext: ReactApplicationContext) :
  NativeRnSavingsNotifierSpec(reactContext) {

  override fun notifyGoalCompleted(goalName: String, promise: Promise) {
    if (goalName.isEmpty()) {
      promise.resolve(null)
      return
    }

    val context = reactApplicationContext.applicationContext
    val message = "Meta completada: $goalName"
    UiThreadUtil.runOnUiThread {
      Toast.makeText(context, message, Toast.LENGTH_LONG).show()
    }
    promise.resolve(null)
  }

  override fun showConfirmDialog(title: String, message: String, promise: Promise) {
    promise.resolve(true)
  }

  companion object {
    const val NAME: String = NativeRnSavingsNotifierSpec.NAME
  }
}
