import React from 'react'
import assert from 'assert'
import { createEditor, Transforms } from 'slate'
import { render, act } from '@testing-library/react'
import { fake } from 'sinon'
import { Slate, withReact, Editable } from '../src'

class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('slate-react', () => {
  window.ResizeObserver = MockResizeObserver as any

  describe('Editable', () => {
    describe('NODE_TO_KEY logic', () => {
      it('should not unmount the node that gets split on a split_node operation', async () => {
        const editor = withReact(createEditor())
        const value = [{ type: 'block', children: [{ text: 'test' }] }]
        const mounts = fake()

        render(
          <Slate editor={editor} value={value} onChange={() => {}}>
            <Editable
              renderElement={({ element, children }) => {
                React.useEffect(() => mounts(element), [element])

                return children
              }}
            />
          </Slate>
        )

        // slate updates at next tick, so we need this to be async
        await act(async () =>
          Transforms.splitNodes(editor, { at: { path: [0, 0], offset: 2 } })
        )

        // 3 renders, one for the the original element, then one each for the two split elements
        assert.equal(
          mounts.callCount,
          3,
          "component wasn't rendered expected number of times"
        )
      })

      it('should not unmount the node that gets merged into on a merge_node operation', async () => {
        const editor = withReact(createEditor())
        const value = [
          { type: 'block', children: [{ text: 'te' }] },
          { type: 'block', children: [{ text: 'st' }] },
        ]
        const mounts = fake()

        render(
          <Slate editor={editor} value={value} onChange={() => {}}>
            <Editable
              renderElement={({ element, children }) => {
                React.useEffect(() => mounts(element), [element])

                return children
              }}
            />
          </Slate>
        )

        // slate updates at next tick, so we need this to be async
        await act(async () =>
          Transforms.mergeNodes(editor, { at: { path: [0, 0], offset: 0 } })
        )

        // only 2 renders for the initial render
        assert.equal(
          mounts.callCount,
          2,
          "component wasn't rendered expected number of times"
        )
      })
    })
  })
})
