import 'cypress-plugin-tab'
import '../../frontend/stylesheets/main-style.less'
import { resetMeta } from './ct/window' // needs to be before i18n
import '../../frontend/js/i18n'
import './shared/commands'
import './shared/exceptions'
import './ct/commands'

beforeEach(function () {
  resetMeta()
})
