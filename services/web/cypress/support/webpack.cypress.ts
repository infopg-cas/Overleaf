import { merge } from 'webpack-merge'
import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import devConfig from '../../webpack.config.dev'

const buildConfig = () => {
  const webpackConfig = merge(devConfig, {
    devServer: {
      static: path.join(__dirname, '../../public'),
      port: 3200,
    },
    stats: 'none',
    plugins: [
      new webpack.EnvironmentPlugin({
        CYPRESS: true,
      }),
      new HtmlWebpackPlugin({
        template: path.resolve('./component-index.html'),
      }),
    ],
  } as any)

  delete webpackConfig.devServer.client

  webpackConfig.entry = {}
  const addWorker = (name: string, importPath: string) => {
    webpackConfig.entry[name] = require.resolve(importPath)
  }

  // add entrypoint under '/' for latex-linter worker
  addWorker(
    'latex-linter-worker',
    '../../frontend/js/features/source-editor/languages/latex/linter/latex-linter.worker'
  )

  // add entrypoints under '/' for pdfjs workers
  addWorker('pdfjs-dist213', 'pdfjs-dist213/legacy/build/pdf.worker.js')
  addWorker('pdfjs-dist401', 'pdfjs-dist401/legacy/build/pdf.worker.mjs')

  return webpackConfig
}

export const webpackConfig = buildConfig()
